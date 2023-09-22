#pragma once

#ifndef Y_SCENE_H
#define Y_SCENE_H

#include <yafray_constants.h>
#include <utilities/threadUtils.h>

#define USER_DATA_SIZE 1024

// Object flags

// Lower order byte indicates type
#define TRIM		0x0000
#define VTRIM		0x0001
#define MTRIM		0x0002

// Higher order byte indicates options
#define INVISIBLEM	0x0100
#define BASEMESH	0x0200

__BEGIN_YAFRAY
class scene_t;
class camera_t;
class material_t;
class object3d_t;
class triangleObject_t;
class meshObject_t;
class surfacePoint_t;
class ray_t;
class diffRay_t;
class primitive_t;
class triKdTree_t;
template<class T> class kdTree_t;
class triangle_t;
class background_t;
class light_t;
class surfaceIntegrator_t;
class volumeIntegrator_t;
class imageFilm_t;
class random_t;
class renderEnvironment_t;
class VolumeRegion;
class renderPasses_t;
class matrix4x4_t;
class color_t;
enum intPassTypes_t : int;

typedef unsigned int objID_t;

/*!
	\var renderState_t::wavelength
		the range is defined going from 400nm (0.0) to 700nm (1.0)
		although the widest range humans can perceive is ofteb given 380-780nm.
*/
struct YAFRAYCORE_EXPORT renderState_t
{
	renderState_t():raylevel(0), currentPass(0), pixelSample(0), rayDivision(1), rayOffset(0), dc1(0), dc2(0),
		traveled(0.0), chromatic(true), includeLights(false), userdata(nullptr), lightdata(nullptr), prng(nullptr) {};
	renderState_t(random_t *rand):raylevel(0), currentPass(0), pixelSample(0), rayDivision(1), rayOffset(0), dc1(0), dc2(0),
		traveled(0.0), chromatic(true), includeLights(false), userdata(nullptr), lightdata(nullptr), prng(rand) {};
	~renderState_t(){};

	int raylevel;
	float depth;
	float contribution; //?
	const void *skipelement;
	int currentPass;
	int pixelSample; //!< number of samples inside this pixels so far
	int rayDivision; //!< keep track of trajectory splitting
	int rayOffset; //!< keep track of trajectory splitting
	float dc1, dc2; //!< used to decorrelate samples from trajectory splitting
	float traveled;
	int pixelNumber;
	int threadID; //!< identify the current render thread; shall range from 0 to scene_t::getNumThreads() - 1
	unsigned int samplingOffs; //!< a "noise-like" pixel offset you may use to decorelate sampling of adjacent pixel.
	//point3d_t screenpos; //!< the image coordinates of the pixel being computed currently
	const camera_t *cam;
	bool chromatic; //!< indicates wether the full spectrum is calculated (true) or only a single wavelength (false).
	bool includeLights; //!< indicate that emission of materials assiciated to lights shall be included, for correctly visible lights etc.
	float wavelength; //!< the (normalized) wavelength being used when chromatic is false.
	float time; //!< the current (normalized) frame time
	mutable void *userdata; //!< a fixed amount of memory where materials may keep data to avoid recalculations...really need better memory management :(
	void *lightdata; //!< reserved; non-dirac lights may do some surface-point dependant initializations in the future to reduce redundancy...
	random_t *const prng; //!< a pseudorandom number generator

	//! set some initial values that are always the same before integrating a primary ray
	void setDefaults()
	{
		raylevel = 0;
		chromatic = true;
		rayDivision = 1;
		rayOffset = 0;
		dc1 = dc2 = 0.f;
		traveled = 0;
	}
	
//	protected:
	explicit renderState_t(const renderState_t &r):prng(r.prng) {}//forbiden
};

__END_YAFRAY

#include "bound.h"
#include <vector>
#include <map>
#include <list>

#define Y_SIG_ABORT 1
#define Y_SIG_PAUSE 1<<1
#define Y_SIG_STOP  1<<2

__BEGIN_YAFRAY

/*! describes an instance of a scene, including all data and functionality to
	create and render a whole scene on the lowest "layer".
	Allocating, configuring and deallocating scene elements etc. however has
	to be performed on the next layer, scene_t only knows the base classes.
	Exception are triangle meshes, which are created by scene_t.
	This implementation currently only supports triangle meshes as geometry,
	for general geometric primitives there will most likely be a separate class
	to keep this one as optimized as possible;
*/
struct objData_t
{
	triangleObject_t *obj;
	meshObject_t *mobj;
	int type;
	size_t lastVertId;
};

struct sceneGeometryState_t
{
	std::list<unsigned int> stack;
	unsigned int changes;
	objID_t nextFreeID;
	objData_t *curObj;
	triangle_t *curTri;
	bool orco;
	float smooth_angle;
};

class YAFRAYCORE_EXPORT scene_t
{
	public:
		scene_t(const renderEnvironment_t *render_environment);
		~scene_t();
		explicit scene_t(const scene_t &s);
		bool render();
		void abort();
		bool startGeometry();
		bool endGeometry();
		bool startTriMesh(objID_t id, int vertices, int triangles, bool hasOrco, bool hasUV=false, int type=0, int object_pass_index=0);
		bool endTriMesh();
		bool startCurveMesh(objID_t id, int vertices, int object_pass_index=0);
		bool endCurveMesh(const material_t *mat, float strandStart, float strandEnd, float strandShape);
		int  addVertex(const point3d_t &p);
		int  addVertex(const point3d_t &p, const point3d_t &orco);
		void addNormal(const normal_t &n);
		bool addTriangle(int a, int b, int c, const material_t *mat);
		bool addTriangle(int a, int b, int c, int uv_a, int uv_b, int uv_c, const material_t *mat);
		int  addUV(float u, float v);
		bool startVmap(int id, int type, int dimensions);
		bool endVmap();
		bool addVmapValues(float *val);
		bool smoothMesh(objID_t id, float angle);
		bool update();

		bool addLight(light_t *l);
		bool removeLight(light_t *l);
		bool addMaterial(material_t *m, const char* name);
		objID_t getNextFreeID();
		bool addObject(object3d_t *obj, objID_t &id);
        bool addInstance(objID_t baseObjectId, const matrix4x4_t &objToWorld);
		void addVolumeRegion(VolumeRegion* vr) { volumes.push_back(vr); }
		void setCamera(camera_t *cam);
		void setImageFilm(imageFilm_t *film);
		void setBackground(background_t *bg);
		void setSurfIntegrator(surfaceIntegrator_t *s);
		surfaceIntegrator_t* getSurfIntegrator() const { return surfIntegrator; }
		void setVolIntegrator(volumeIntegrator_t *v);
		void setAntialiasing(int numSamples, int numPasses, int incSamples, double threshold, float resampled_floor, float sample_multiplier_factor, float light_sample_multiplier_factor, float indirect_sample_multiplier_factor, bool detect_color_noise, int dark_detection_type, float dark_threshold_factor, int variance_edge_size, int variance_pixels, float clamp_samples, float clamp_indirect);
		void setNumThreads(int threads);
		void setNumThreadsPhotons(int threads_photons);
		void setMode(int m){ mode = m; }
		background_t* getBackground() const;
		triangleObject_t* getMesh(objID_t id) const;
		object3d_t* getObject(objID_t id) const;
		std::vector<VolumeRegion*> getVolumes() const { return volumes; }
		const camera_t* getCamera() const { return camera; }
		imageFilm_t* getImageFilm() const { return imageFilm; }
		bound_t getSceneBound() const;
		int getNumThreads() const { return nthreads; }
		int getNumThreadsPhotons() const { return nthreads_photons; }
		int getSignals() const;
		//! only for backward compatibility!
		void getAAParameters(int &samples, int &passes, int &inc_samples, float &threshold, float &resampled_floor, float &sample_multiplier_factor, float &light_sample_multiplier_factor, float &indirect_sample_multiplier_factor, bool &detect_color_noise, int &dark_detection_type, float &dark_threshold_factor, int &variance_edge_size, int &variance_pixels, float &clamp_samples, float &clamp_indirect) const;
		bool intersect(const ray_t &ray, surfacePoint_t &sp) const;
		bool intersect(const diffRay_t &ray, surfacePoint_t &sp) const;
		bool isShadowed(renderState_t &state, const ray_t &ray, float &obj_index, float &mat_index) const;
		bool isShadowed(renderState_t &state, const ray_t &ray, int maxDepth, color_t &filt, float &obj_index, float &mat_index) const;
		const renderPasses_t* getRenderPasses() const;
		bool pass_enabled(intPassTypes_t intPassType) const;

		enum sceneState { READY, GEOMETRY, OBJECT, VMAP };
		enum changeFlags { C_NONE=0, C_GEOM=1, C_LIGHT= 1<<1, C_OTHER=1<<2,
							C_ALL=C_GEOM|C_LIGHT|C_OTHER };

		std::vector<light_t *> lights;
		volumeIntegrator_t *volIntegrator;

		float shadowBias;  //shadow bias to apply to shadows to avoid self-shadow artifacts
		bool shadowBiasAuto;  //enable automatic shadow bias calculation

		float rayMinDist;  //ray minimum distance
		bool rayMinDistAuto;  //enable automatic ray minimum distance calculation

	protected:

		sceneGeometryState_t state;
		std::map<objID_t, object3d_t *> objects;
		std::map<objID_t, objData_t> meshes;
        std::map< std::string, material_t * > materials;
		std::vector<VolumeRegion *> volumes;
        camera_t *camera;
		imageFilm_t *imageFilm;
		triKdTree_t *tree; //!< kdTree for triangle-only mode
		kdTree_t<primitive_t> *vtree; //!< kdTree for universal mode
		background_t *background;
		surfaceIntegrator_t *surfIntegrator;
		bound_t sceneBound; //!< bounding box of all (finite) scene geometry

		int AA_samples, AA_passes;
		int AA_inc_samples; //!< sample count for additional passes
		float AA_threshold;
		float AA_resampled_floor; //!< minimum amount of resampled pixels (% of the total pixels) below which we will automatically decrease the AA_threshold value for the next pass
		float AA_sample_multiplier_factor;
		float AA_light_sample_multiplier_factor;
		float AA_indirect_sample_multiplier_factor;
		bool AA_detect_color_noise;
		int AA_dark_detection_type;
		float AA_dark_threshold_factor;
		int AA_variance_edge_size;
		int AA_variance_pixels;
		float AA_clamp_samples;
		float AA_clamp_indirect;
		int nthreads;
		int nthreads_photons;
		int mode; //!< sets the scene mode (triangle-only, virtual primitives)
		int signals;
		const renderEnvironment_t *env;	//!< reference to the environment to which this scene belongs to
		mutable std::mutex sig_mutex;
};

__END_YAFRAY

#endif // Y_SCENE_H
