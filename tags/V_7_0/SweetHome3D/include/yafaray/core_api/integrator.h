#pragma once
/****************************************************************************
 *		integrator.h: the interface definition for light integrators
 *      This is part of the yafray package
 *      Copyright (C) 2006  Mathias Wein (Lynx)
 *      Copyright (C) 2010  Rodrigo Placencia (DarkTide)
 *
 *      This library is free software; you can redistribute it and/or
 *      modify it under the terms of the GNU Lesser General Public
 *      License as published by the Free Software Foundation; either
 *      version 2.1 of the License, or (at your option) any later version.
 *
 *      This library is distributed in the hope that it will be useful,
 *      but WITHOUT ANY WARRANTY; without even the implied warranty of
 *      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *      Lesser General Public License for more details.
 *
 *      You should have received a copy of the GNU Lesser General Public
 *      License along with this library; if not, write to the Free Software
 *      Foundation,Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */

#ifndef Y_INTEGRATOR_H
#define Y_INTEGRATOR_H

#include <yafray_constants.h>
#include <string>

__BEGIN_YAFRAY

/*!	Integrate the incoming light scattered by the surfaces
	hit by a given ray
*/

class scene_t;
class progressBar_t;
class imageFilm_t;
struct renderArea_t;
class colorA_t;
struct renderState_t;
class ray_t;
class diffRay_t;
class colorPasses_t;


class YAFRAYCORE_EXPORT integrator_t
{
	public:
		integrator_t() { scene = nullptr; intpb = nullptr; }
		//! this MUST be called before any other member function!
		void setScene(scene_t *s) { scene=s; }
		/*! do whatever is required to render the image, if suitable for integrating whole image */
		virtual bool render(int numView, imageFilm_t *imageFilm) { return false; }
		virtual void setProgressBar(progressBar_t *pb) { intpb = pb; }
		virtual std::string getShortName() const { return integratorShortName; }
		virtual std::string getName() const { return integratorName; }
		virtual ~integrator_t() {}
		enum TYPE { SURFACE, VOLUME };
		TYPE integratorType(){ return type; }

	protected:
		TYPE type;
		scene_t *scene;
		progressBar_t *intpb;
		std::string integratorName;
		std::string integratorShortName;
};

class YAFRAYCORE_EXPORT surfaceIntegrator_t: public integrator_t
{
	public:
		/*! gets called before the scene rendering (i.e. before first call to integrate)
			\return false when preprocessing could not be done properly, true otherwise */
		virtual bool preprocess() { return true; };
		/*! allow the integrator to do some cleanup when an image is done
		(possibly also important for multiframe rendering in the future)	*/
		virtual void cleanup() {}
		virtual colorA_t integrate(renderState_t &state, diffRay_t &ray, colorPasses_t &colPasses, int additionalDepth = 0) const = 0;
	protected:
		surfaceIntegrator_t() {} //don't use...
};

class YAFRAYCORE_EXPORT volumeIntegrator_t: public integrator_t
{
	public:
		volumeIntegrator_t() {}
		virtual colorA_t transmittance(renderState_t &state, ray_t &ray) const = 0;
		virtual colorA_t integrate(renderState_t &state, ray_t &ray, colorPasses_t &colPasses, int additionalDepth = 0) const = 0;
		virtual bool preprocess() { return true; }
	
	protected:
};

__END_YAFRAY

#endif // Y_INTEGRATOR_H
