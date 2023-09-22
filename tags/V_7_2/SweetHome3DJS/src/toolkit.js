/*
 * toolkit.js
 *
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

// Requires UserPreferences.js
// Requires ResourceAction.js

/**
 * The root class for additional UI components.
 * @param {UserPreferences} preferences the current user preferences
 * @param {string|HTMLElement} template template element (view HTML will be this element's innerHTML) 
 *     or HTML string (if null or undefined, then the component creates an empty div for the root node)
 * @param {boolean} [useElementAsRootHTMLElement]
 * @constructor
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
function JSComponent(preferences, template, useElementAsRootHTMLElement) {
  this.preferences = preferences;

  if (template instanceof HTMLElement && useElementAsRootHTMLElement === true) {
    this.container = template;
  } else {
    var html = "";
    if (template != null) {
      html = typeof template == "string" ? template : template.innerHTML;
    }
    this.container = document.createElement("div");
    this.container.innerHTML = this.buildHtmlFromTemplate(html);
  }
}

/**
 * Returns the HTML element used to view this component.
 * @return {HTMLElement}
 */
JSComponent.prototype.getHTMLElement = function() {
  return this.container;
}

/**
 * Returns the user preferences used to localize this component.
 * @return {UserPreferences}
 */
JSComponent.prototype.getUserPreferences = function() {
  return this.preferences;
}

/**
 * Returns true if element is or is child of candidateParent, false otherwise.
 * @param {HTMLElement} element
 * @param {HTMLElement} candidateParent
 * @return {boolean}
 */
JSComponent.isElementContained = function(element, candidateParent) {
  if (element == null || candidateParent == null) {
    return false;
  }

  var currentParent = element;
  do {
    if (currentParent == candidateParent) {
      return true;
    }
  } while (currentParent = currentParent.parentElement);

  return false;
}

/**
 * Substitutes all the place holders in the html with localized labels.
 * @param {UserPreferences} preferences the current user preferences
 * @param {string} html 
 */
JSComponent.substituteWithLocale = function(preferences, html) {
  return html.replace(/\@\{([a-zA-Z0-9_.]+)\}/g, function(fullMatch, str) {
      return ResourceAction.getLocalizedLabelText(preferences, 
          str.substring(0, str.indexOf('.')), str.substring(str.indexOf('.') + 1));
    });
}

/**
 * Substitutes all the place holders in the given html with localized labels.
 * @param {string} templateHtml 
 */
JSComponent.prototype.buildHtmlFromTemplate = function(templateHtml) {
  return JSComponent.substituteWithLocale(this.preferences, templateHtml);
}

/**
 * Returns the localized text defined for the given <code>>resourceClass</code> + <code>propertyKey</code>.
 * @param {Object} resourceClass
 * @param {string} propertyKey
 * @param {Array} resourceParameters
 * @return {string}
 * @protected
 */
JSComponent.prototype.getLocalizedLabelText = function(resourceClass, propertyKey, resourceParameters) {
  return ResourceAction.getLocalizedLabelText(this.preferences, resourceClass, propertyKey, resourceParameters);
}

/**
 * Attaches the given component to a child DOM element, becoming a child component.
 * @param {string} name the component's name, which matches child DOM element name (as defined in {@link JSComponent#getElement})
 * @param {JSComponent} component child component instance
 */
JSComponent.prototype.attachChildComponent = function(name, component) {
  this.getElement(name).appendChild(component.getHTMLElement());
}

/**
 * Registers the given listener on given elements(s) and removes them when this component is disposed.
 * @param {(HTMLElement[]|HTMLElement)} elements
 * @param {string} eventName
 * @param {function} listener
 */
JSComponent.prototype.registerEventListener = function(elements, eventName, listener) {
  if (elements == null) {
    return;
  }
  if (elements instanceof NodeList || elements instanceof HTMLCollection) {
    var array = new Array(elements.length);
    for (var i = 0; i < elements.length; i++) {
      array[i] = elements[i];
    }
    elements = array;
  }
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  if (this.listeners == null) {
    this.listeners = [];
  }
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    element.addEventListener(eventName, listener, false);
  }
  this.listeners.push(
      {
        listener: listener,
        eventName: eventName,
        elements: elements
      });
}

/**
 * Registers the given property change listener on object and removes it when this component is disposed.
 * @param {Object} object
 * @param {string} propertyName
 * @param {function} listener
 */
JSComponent.prototype.registerPropertyChangeListener = function(object, propertyName, listener) {
  object.addPropertyChangeListener(propertyName, listener);
  this.listeners.push(
      {
        listener: listener,
        propertyName: propertyName,
        object: object
      });
}

/**
 * Releases all listeners registered with {@link JSComponent#registerEventListener}
 * @private
 */
JSComponent.prototype.unregisterEventListeners = function() {
  if (Array.isArray(this.listeners)) {
    for (var i = 0; i < this.listeners.length; i++) {
      var registeredEntry = this.listeners[i];
      if (registeredEntry.eventName !== undefined) {
        for (var j = 0; j < registeredEntry.elements.length; j++) {
          var element = registeredEntry.elements[j];
          element.removeEventListener(registeredEntry.eventName, registeredEntry.listener);
        }
      } else {
        registeredEntry.object.removePropertyChangeListener(registeredEntry.propertyName, registeredEntry.listener);
      }
    }
  }
}

/**
 * Returns the named element that corresponds to the given name within this component.
 * A named element shall define the "name" attribute (for instance an input), or
 * a "data-name" attribute if the name attribute is not supported.
 */
JSComponent.prototype.getElement = function(name) {
  var element = this.container.querySelector("[name='" + name + "']");
  if (element == null) {
    element = this.container.querySelector("[data-name='" + name + "']");
  }
  return element;
}

/**
 * Returns the element that matches the given query selector within this component.
 * @param {string} query css selector to be applied on children elements
 */
JSComponent.prototype.findElement = function(query) {
  return this.container.querySelector(query);
}

/**
 * Returns the elements that match the given query selector within this component.
 * @param {string} query css selector to be applied on children elements
 */
JSComponent.prototype.findElements = function(query) {
  return this.container.querySelectorAll(query);
}

/**
 * Releases any resource or listener associated with this component, when it's disposed. 
 * Override to perform custom clean.
 * Don't forget to call super method: JSComponent.prototype.dispose()
 */
JSComponent.prototype.dispose = function() {
  this.unregisterEventListeners();
}

/**
 * @param {string} value option's value
 * @param {string} text option's display text
 * @param {boolean} [selected] true if selected, default false
 * @return {HTMLOptionElement}
 * @ignore
 */
JSComponent.createOptionElement = function(value, text, selected) {
  var option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  if (selected !== undefined) {
    option.selected = selected;
  }
  return option;
}


/**
 * A class to create dialogs.
 * @param preferences      the current user preferences
 * @param {string} title the dialog's title (may contain HTML)
 * @param {string|HTMLElement} template template element (view HTML will be this element's innerHTML) or HTML string (if null or undefined, then the component creates an empty div
 * for the root node)
 * @param {{applier: function(JSDialog), disposer: function(JSDialog), size?: "small"|"medium"|"default"}} [behavior]
 * - applier: an optional dialog application function
 * - disposer: an optional dialog function to release associated resources, listeners, ...
 * - size: override style with "small" or "medium"
 * @constructor
 * @author Renaud Pawlak
 */
function JSDialog(preferences, title, template, behavior) {
  JSComponent.call(this, preferences, template, behavior);

  var dialog = this;
  if (behavior != null) {
    this.applier = behavior.applier;
    this.disposer = behavior.disposer;
  }

  this.getHTMLElement().classList.add("dialog-container");
  if (behavior.size) {
    this.getHTMLElement().classList.add(behavior.size);
  }
  this.getHTMLElement()._dialogBoxInstance = this;

  document.body.appendChild(this.getHTMLElement());

  if (title != null) {
    this.setTitle(title);
  }

  this.registerEventListener(this.getCloseButton(), "click", function() {
      dialog.cancel();
    });
  this.registerEventListener(this.getHTMLElement(), "mousedown", function(ev) {
      ev.stopPropagation();
    });

  this.buttonsPanel = this.findElement(".dialog-buttons");
  if (OperatingSystem.isMacOSX()) {
    this.buttonsPanel.classList.add("mac");
  }
  this.appendButtons(this.buttonsPanel);
  this.getHTMLElement().classList.add('buttons-' + this.buttonsPanel.querySelectorAll('button').length);
}
JSDialog.prototype = Object.create(JSComponent.prototype);
JSDialog.prototype.constructor = JSDialog;

/**
 * Appends dialog buttons to given panel.
 * Caution : this method is called from constructor.
 * @param {HTMLElement} buttonsPanel Dialog buttons panel
 * @protected
 */
JSDialog.prototype.appendButtons = function(buttonsPanel) {
  var html;
  if (this.applier) {
    html = "<button class='dialog-ok-button default-capable'>@{OptionPane.okButton.textAndMnemonic}</button>"
         + "<button class='dialog-cancel-button'>@{OptionPane.cancelButton.textAndMnemonic}</button>";
  } else {
    html = "<button class='dialog-cancel-button default-capable'>@{InternalFrameTitlePane.closeButtonAccessibleName}</button>";
  }
  buttonsPanel.innerHTML = JSComponent.substituteWithLocale(this.getUserPreferences(), html);

  var dialog = this;
  var cancelButton = this.findElement(".dialog-cancel-button");
  if (cancelButton) {
    this.registerEventListener(cancelButton, "click", function(ev) {
        dialog.cancel();
      });
  }
  var okButton = this.findElement(".dialog-ok-button");
  if (okButton) {
    this.registerEventListener(okButton, "click", function(ev) {
        dialog.validate();
      });
  }
}

/**
 * Closes currently displayed topmost dialog if any.
 * @private
 */
JSDialog.closeTopMostDialog = function() {
  var topMostDialog = JSDialog.getTopMostDialog();
  if (topMostDialog != null) {
    topMostDialog.close();
  }
}

/**
 * Returns the currently displayed topmost dialog if any.
 * @return {JSDialog} currently displayed topmost dialog if any, otherwise null
 * @ignore
 */
JSDialog.getTopMostDialog = function() {
  var visibleDialogElements = document.querySelectorAll(".dialog-container.visible");
  var topMostDialog = null;
  if (visibleDialogElements.length > 0) {
    for (var i = 0; i < visibleDialogElements.length; i++) {
      var visibleDialog = visibleDialogElements[i]._dialogBoxInstance;
      if (topMostDialog == null || topMostDialog.displayIndex <= visibleDialog.displayIndex) {
        topMostDialog = visibleDialog;
      }
    }
  }
  return topMostDialog;
}

/**
 * @param {string} templateHtml
 */
JSDialog.prototype.buildHtmlFromTemplate = function(templateHtml) {
  return JSComponent.substituteWithLocale(this.getUserPreferences(),
      '<div class="dialog-content">' +
      '  <div class="dialog-top">' +
      '    <span class="title"></span>' +
      '    <span class="dialog-close-button">&times;</span>' +
      '  </div>' +
      '  <div class="dialog-body">' +
      JSComponent.prototype.buildHtmlFromTemplate.call(this, templateHtml) +
      '  </div>' +
      '  <div class="dialog-buttons">' +
      '  </div>' +
      '</div>');
}

/**
 * Returns the input that corresponds to the given name within this dialog.
 */
JSDialog.prototype.getInput = function(name) {
  return this.getHTMLElement().querySelector("[name='" + name + "']");
}

/**
 * Returns the close button of this dialog.
 */
JSDialog.prototype.getCloseButton = function() {
  return this.getHTMLElement().querySelector(".dialog-close-button");
}

/**
 * Called when the user presses the OK button.
 * Override to implement custom behavior when the dialog is validated by the user.
 */
JSDialog.prototype.validate = function() {
  if (this.applier != null) {
    this.applier(this);
  }
  this.close();
}

/**
 * Called when the user closes the dialog with no validation.
 */
JSDialog.prototype.cancel = function() {
  this.close();
}

/**
 * Closes the dialog and discard the associated DOM.
 */
JSDialog.prototype.close = function() {
  this.getHTMLElement().classList.add("closing");
  var dialog = this;
  // Let 500ms before releasing the dialog so that the closing animation can apply
  setTimeout(function() {
      dialog.getHTMLElement().classList.remove("visible");
      dialog.dispose();
      if (dialog.getHTMLElement() && document.body.contains(dialog.getHTMLElement())) {
        document.body.removeChild(dialog.getHTMLElement());
      }
    }, 500);
}

/**
 * Releases any resource or listener associated with this component, when it's disposed. 
 * Override to perform custom clean - Don't forget to call super.dispose().
 */
JSDialog.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
  if (typeof this.disposer == "function") {
    this.disposer(this);
  }
}

/**
 * Sets dialog title
 * @param {string} title
 */
JSDialog.prototype.setTitle = function(title) {
  var titleElement = this.findElement(".dialog-top .title");
  titleElement.textContent = JSComponent.substituteWithLocale(this.getUserPreferences(), title || "");
}

/**
 * @return {boolean} true if this dialog is currently shown, false otherwise
 */
JSDialog.prototype.isDisplayed = function() {
  return this.getHTMLElement().classList.contains("visible");
}

/**
 * Default implementation of the DialogView.displayView function.
 */
JSDialog.prototype.displayView = function(parentView) {
  var dialog = this;

  this.getHTMLElement().style.display = "block";

  // Force browser to refresh before adding visible class to allow transition on width and height
  setTimeout(function() {
      dialog.getHTMLElement().classList.add("visible");
      dialog.displayIndex = JSDialog.shownDialogsCounter++;
      var inputs = dialog.findElements('input');
      for (var i = 0; i < inputs.length; i++) {
        var focusedInput = inputs[i];
        if (!focusedInput.classList.contains("not-focusable-at-opening")) {
          focusedInput.focus();
          break;
        }
      }
    }, 100);
}

JSDialog.shownDialogsCounter = 0;


/**
 * A class to create wizard dialogs.
 * @param {UserPreferences} preferences the current user preferences
 * @param {WizardController} controller wizard's controller
 * @param {string} title the dialog's title (may contain HTML)
 * @param {string|HTMLElement} template template element (view HTML will be this element's innerHTML) or HTML string (if null or undefined, then the component creates an empty div
 * for the root node)
 * @param {{applier: function(JSDialog), disposer: function(JSDialog)}} [behavior]
 * - applier: an optional dialog application function
 * - disposer: an optional dialog function to release associated resources, listeners, ...
 * @constructor
 * @author Louis Grignon
 */
function JSWizardDialog(preferences, controller, title, behavior) {
  JSDialog.call(this, preferences, title,
      '<div class="wizard">' +
      '  <div stepIcon><div></div></div>' +
      '  <div stepView></div>' +
      '</div>',
      behavior);

  this.getHTMLElement().classList.add("wizard-dialog");

  this.controller = controller;
  this.stepIconPanel = this.findElement("[stepIcon]");
  this.stepViewPanel = this.findElement("[stepView]");

  var dialog = this;
  this.cancelButton = this.findElement(".wizard-cancel-button");
  this.backButton = this.findElement(".wizard-back-button");
  this.nextButton = this.findElement(".wizard-next-button");

  this.registerEventListener(this.cancelButton, "click", function(ev) {
      dialog.cancel();
    });

  this.backButton.disabled = !controller.isBackStepEnabled();
  this.registerPropertyChangeListener(controller, "BACK_STEP_ENABLED", function(ev) {
      dialog.backButton.disabled = !controller.isBackStepEnabled();
    });

  this.nextButton.disabled = !controller.isNextStepEnabled();
  this.registerPropertyChangeListener(controller, "NEXT_STEP_ENABLED", function(ev) {
      dialog.nextButton.disabled = !controller.isNextStepEnabled();
    });

  this.updateNextButtonText();
  this.registerPropertyChangeListener(controller, "LAST_STEP", function(ev) {
      dialog.updateNextButtonText();
    });

  this.registerEventListener(this.backButton, "click", function(ev) {
      controller.goBackToPreviousStep();
    });
  this.registerEventListener(this.nextButton, "click", function(ev) {
      if (controller.isLastStep()) {
        controller.finish();
        if (dialog != null) {
          dialog.validate();
        }
      } else {
        controller.goToNextStep();
      }
    });

  this.updateStepView();
  this.registerPropertyChangeListener(controller, "STEP_VIEW", function(ev) {
      dialog.updateStepView();
    });

  this.updateStepIcon();
  this.registerPropertyChangeListener(controller, "STEP_ICON", function(ev) {
      dialog.updateStepIcon();
    });
  
  this.registerPropertyChangeListener(controller, "TITLE", function(ev) {
      dialog.setTitle(controller.getTitle());
    });
}
JSWizardDialog.prototype = Object.create(JSDialog.prototype);
JSWizardDialog.prototype.constructor = JSWizardDialog;

/**
 * Append dialog buttons to given panel
 * @param {HTMLElement} buttonsPanel Dialog buttons panel
 * @protected
 */
JSWizardDialog.prototype.appendButtons = function(buttonsPanel) {
  var cancelButton = "<button class='wizard-cancel-button'>@{InternalFrameTitlePane.closeButtonAccessibleName}</button>";
  var backButton = "<button class='wizard-back-button'>@{WizardPane.backOptionButton.text}</button>";
  var nextButton = "<button class='wizard-next-button default-capable'></button>";
  var buttons = "<div class='dialog-buttons'>" 
      + (OperatingSystem.isMacOSX() ? nextButton + backButton : backButton + nextButton) 
      + cancelButton + "</div>";
  buttonsPanel.innerHTML = JSComponent.substituteWithLocale(this.getUserPreferences(), buttons);
}

/**
 * Change text of the next button depending on if state is last step or not
 * @private
 */
JSWizardDialog.prototype.updateNextButtonText = function() {
  this.nextButton.innerText = this.getLocalizedLabelText("WizardPane",
      this.controller.isLastStep()
          ? "finishOptionButton.text"
          : "nextOptionButton.text");
}

/**
 * Updates UI for current step.
 * @private
 */
JSWizardDialog.prototype.updateStepView = function() {
  var stepView = this.controller.getStepView();
  this.stepViewPanel.innerHTML = "";
  this.stepViewPanel.appendChild(stepView.getHTMLElement());
}

/**
 * Updates image for current step.
 * @private
 */
JSWizardDialog.prototype.updateStepIcon = function() {
  var iconPanel = this.stepIconPanel;
  var imageContainer = this.stepIconPanel.querySelector('div');
  imageContainer.innerHTML = "";
  // Add new icon
  var stepIcon = this.controller.getStepIcon();
  if (stepIcon != null) {
    var backgroundColor1 = "rgb(163, 168, 226)";
    var backgroundColor2 = "rgb(80, 86, 158)";
    try {
      // Read gradient colors used to paint icon background
      var stepIconBackgroundColors = this.getLocalizedLabelText(
          "WizardPane", "stepIconBackgroundColors").trim().split(" ");
      backgroundColor1 = stepIconBackgroundColors[0];
      if (stepIconBackgroundColors.length == 1) {
        backgroundColor2 = backgroundColor1;
      } else if (stepIconBackgroundColors.length == 2) {
        backgroundColor2 = stepIconBackgroundColors[1];
      }
    } catch (ex) {
      // Do not change if exception
    }

    var gradientColor1 = backgroundColor1;
    var gradientColor2 = backgroundColor2;
    iconPanel.style.background = "linear-gradient(180deg, " + gradientColor1 + " 0%, " + gradientColor2 + " 100%)";
    iconPanel.style.border = "solid 1px #333333";
    var icon = new Image();
    icon.crossOrigin = "anonymous";
    imageContainer.appendChild(icon);
    icon.src = stepIcon.indexOf("://") === -1 
        ?  ZIPTools.getScriptFolder() + stepIcon 
        : stepIcon;
  }
}


/**
 * A dialog prompting user to choose whether an image should be resized or not.
 * @param {UserPreferences} preferences
 * @param {string} title title of the dialog
 * @param {string} message message to be displayed
 * @param {string} cancelButtonMessage
 * @param {string} keepUnchangedButtonMessage
 * @param {string} okButtonMessage
 * @param {function()} imageResizeRequested called when user selected "resize image" option
 * @param {function()} originalImageRequested called when user selected "keep image unchanged" option
 * @constructor
 * @package
 * @ignore
 */
function JSImageResizingDialog(preferences,
                title, message, cancelButtonMessage, keepUnchangedButtonMessage, okButtonMessage, 
                imageResizeRequested, originalImageRequested) {
  this.cancelButtonMessage = JSComponent.substituteWithLocale(preferences, cancelButtonMessage);
  this.keepUnchangedButtonMessage = JSComponent.substituteWithLocale(preferences, keepUnchangedButtonMessage);
  this.okButtonMessage = JSComponent.substituteWithLocale(preferences, okButtonMessage);
  
  JSDialog.call(this, preferences,
      JSComponent.substituteWithLocale(preferences, title),
      "<div>" +
      JSComponent.substituteWithLocale(preferences, message).replace("<br>", " ") +
      "</div>",
      {
        applier: function(dialog) {
          if (dialog.resizeRequested) {
            imageResizeRequested();
          } else {
            originalImageRequested();
          }
        }
      });
  
  var dialog = this;
  var cancelButton = this.findElement(".dialog-cancel-button");
  this.registerEventListener(cancelButton, "click", function(ev) {
      dialog.cancel();
    });
  var okButtons = this.findElements(".dialog-ok-button");
  this.registerEventListener(okButtons, "click", function(ev) {
      dialog.resizeRequested = !ev.target.classList.contains("keep-image-unchanged-button");
      dialog.validate();
    });
}
JSImageResizingDialog.prototype = Object.create(JSDialog.prototype);
JSImageResizingDialog.prototype.constructor = JSImageResizingDialog;

/**
 * Appends dialog buttons to given panel.
 * @param {HTMLElement} buttonsPanel Dialog buttons panel
 * @protected
 */
JSImageResizingDialog.prototype.appendButtons = function(buttonsPanel) {
  buttonsPanel.innerHTML = JSComponent.substituteWithLocale(this.getUserPreferences(),
      "<button class='dialog-ok-button default-capable'>" + this.okButtonMessage + "</button>"
      + "<button class='keep-image-unchanged-button dialog-ok-button'>" + this.keepUnchangedButtonMessage + "</button>"
      + "<button class='dialog-cancel-button'>" + this.cancelButtonMessage + "</button>");
}


/**
 * Class handling context menus.
 * @param {UserPreferences} preferences the current user preferences
 * @param {HTMLElement|HTMLElement[]} sourceElements context menu will show when right click on this element. 
 *        Cannot be null for the root node
 * @param {function(JSPopupMenu.Builder, HTMLElement)}  build 
 *    Function called with a builder, and optionally with source element (which was right clicked, to show this menu)
 * @constructor
 * @ignore
 * @author Louis Grignon
 * @author Renaud Pawlak
 */
function JSPopupMenu(preferences, sourceElements, build) {
  if (sourceElements == null || sourceElements.length === 0) {
    throw new Error("Cannot register a context menu on an empty list of elements");
  }
  JSComponent.call(this, preferences, "");

  this.sourceElements = sourceElements;
  if (!Array.isArray(sourceElements)) {
    this.sourceElements = [sourceElements];
  }
  this.build = build;
  this.getHTMLElement().classList.add("popup-menu");

  document.body.appendChild(this.getHTMLElement());

  var popupMenu = this;
  this.registerEventListener(sourceElements, "contextmenu", function(ev) {
      ev.preventDefault();
      if (JSPopupMenu.current != null) {
        JSPopupMenu.current.close();
      }
      popupMenu.showSourceElement(this, ev);
    });
}
JSPopupMenu.prototype = Object.create(JSComponent.prototype);
JSPopupMenu.prototype.constructor = JSPopupMenu;

/**
 * Closes currently displayed context menu if any.
 * @static
 * @private
 */
JSPopupMenu.closeOpenedMenu = function() {
  if (JSPopupMenu.current != null) {
    JSPopupMenu.current.close();
    return true;
  }
  return false;
}

/**
 * @param {HTMLElement} sourceElement
 * @param {Event} ev
 * @private
 */
JSPopupMenu.prototype.showSourceElement = function(sourceElement, ev) {
  this.menuItemListeners = [];

  var builder = new JSPopupMenu.Builder();
  this.build(builder, sourceElement);

  var items = builder.items;
  // Remove last element if it is a separator
  if (items.length > 0 && items[items.length - 1] == JSPopupMenu.CONTEXT_MENU_SEPARATOR_ITEM) {
    items.pop();
  }
  var menuElement = this.createMenuElement(items);

  this.getHTMLElement().appendChild(menuElement);
  
  // Accept focus
  this.getHTMLElement().setAttribute("tabindex", 1000);
  this.getHTMLElement().style.outline = "none";
  this.getHTMLElement().style.outlineWidth = "0";

  // Temporarily use hidden visibility to get element's height
  this.getHTMLElement().style.visibility = "hidden";
  this.getHTMLElement().classList.add("visible");

  // Adjust top/left and display
  var anchorX = ev.clientX;
  if (menuElement.clientWidth > window.innerWidth) {
    anchorX = 0;
  } else if (anchorX + menuElement.clientWidth + 20 > window.innerWidth) {
    anchorX = Math.max(0, window.innerWidth - menuElement.clientWidth - 20);
  }
  var anchorY = ev.clientY;
  if (menuElement.clientHeight > window.innerHeight) {
    anchorY = 0;
  } else if (anchorY + menuElement.clientHeight + 10 > window.innerHeight) {
    anchorY = window.innerHeight - menuElement.clientHeight - 10;
  }

  this.getHTMLElement().style.visibility = "visible";
  this.getHTMLElement().style.left = anchorX + "px";
  this.getHTMLElement().style.top = anchorY + "px";
  // Request focus to receive esc key press
  this.getHTMLElement().focus();

  JSPopupMenu.current = this;
}

/**
 * @param {{}[]} items same type as JSPopupMenu.Builder.items
 * @param {number} [zIndex] default to initial value: 1000
 * @return {HTMLElement} menu root html element (`<ul>`)
 * @private
 */
JSPopupMenu.prototype.createMenuElement = function(items, zIndex) {
  if (zIndex === undefined) {
    zIndex = 1000;
  }

  var menuElement = document.createElement("ul");
  menuElement.classList.add("items");
  menuElement.style.zIndex = zIndex;
  menuElement.addEventListener("contextmenu", function(ev) {
      ev.preventDefault();
    });

  var backElement = document.createElement("li");
  backElement.classList.add("item");
  backElement.classList.add("back");
  backElement.textContent = "×";
  this.registerEventListener(backElement, "click", function(ev) {
      var isRootMenu = menuElement.parentElement.tagName.toLowerCase() != "li";
      if (isRootMenu) {
        JSPopupMenu.closeOpenedMenu();
      } else {
        menuElement.classList.remove("visible");
        ev.stopPropagation();
      }
    });
  menuElement.appendChild(backElement);

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    var itemElement = document.createElement("li");
    if (item == JSPopupMenu.CONTEXT_MENU_SEPARATOR_ITEM) {
      itemElement.classList.add("separator");
    } else {
      this.initMenuItemElement(itemElement, item, zIndex);
    }

    menuElement.appendChild(itemElement)
  }

  return menuElement;
}

/**
 * Initializes a menu item element for the given item descriptor (model).
 * @param {HTMLElement} menuItemElement
 * @param {{}[]} item an item from JSPopupMenu.Builder.items
 * @param {number} zIndex current menu z-index
 * @private
 */
JSPopupMenu.prototype.initMenuItemElement = function(itemElement, item, zIndex) {
  var popupMenu = this;

  var itemIconElement = document.createElement("img");
  if (item.iconPath != null) {
    itemIconElement.src = item.iconPath;
    itemIconElement.classList.add("visible");
  }

  if (item.mode !== undefined) {
    itemElement.classList.add("checkable");
    if (item.selected === true) {
      itemElement.classList.add("selected");
    }
    if (item.iconPath == null) {
      itemIconElement = document.createElement("span");
      itemIconElement.innerHTML = item.selected === true ? "✓" : "&nbsp;";
      itemIconElement.classList.add("visible");
    }
  }

  var itemLabelElement = document.createElement("span");
  itemLabelElement.textContent = JSComponent.substituteWithLocale(this.getUserPreferences(), item.label);
  itemElement.classList.add("item");
  itemIconElement.classList.add("icon");
  itemElement.appendChild(itemIconElement);
  itemElement.appendChild(itemLabelElement);
  if (Array.isArray(item.subItems)) {
    itemElement.classList.add("sub-menu");

    var subMenuElement = this.createMenuElement(item.subItems, zIndex + 1);
    this.registerEventListener(itemElement, "click", function(ev) {
        subMenuElement.classList.add("visible");
      });
    this.registerEventListener(itemElement, "mouseover", function(ev) {
        var itemRect = itemElement.getBoundingClientRect();
        subMenuElement.style.position = "fixed";
        var anchorX = itemRect.left + itemElement.clientWidth;
        if (subMenuElement.clientWidth > window.innerWidth) {
          anchorX = 0;
        } else if (anchorX + subMenuElement.clientWidth > window.innerWidth) {
          anchorX = window.innerWidth - subMenuElement.clientWidth;
        }
        var anchorY = itemRect.top;
        if (subMenuElement.clientHeight > window.innerHeight) {
          anchorY = 0;
        } else if (anchorY + subMenuElement.clientHeight > window.innerHeight) {
          anchorY = window.innerHeight - subMenuElement.clientHeight;
        }
        subMenuElement.style.left = anchorX;
        subMenuElement.style.top = anchorY;
      });

    itemElement.appendChild(subMenuElement);
  }

  if (typeof item.itemSelectedListener == "function") {
    var listener = function() {
        popupMenu.close();
        setTimeout(function() {
            item.itemSelectedListener();
          }, 50);
      };
    itemElement.addEventListener("click", listener);
    itemElement.addEventListener("mouseup", listener);
    this.menuItemListeners.push(function() {
        itemElement.removeEventListener("click", listener);
        itemElement.removeEventListener("mouseup", listener);
      });
  }
}

/**
 * Closes the context menu.
 */
JSPopupMenu.prototype.close = function() {
  this.getHTMLElement().removeAttribute("tabindex");
  this.getHTMLElement().classList.remove("visible");
  JSPopupMenu.current = null;

  if (this.menuItemListeners) {
    for (var i = 0; i < this.menuItemListeners.length; i++) {
      this.menuItemListeners[i]();
    }
  }

  this.menuItemListeners = null;
  this.getHTMLElement().innerHTML = "";
}

/**
 * Builds items of a context menu which is about to be shown.
 * @ignore
 */
JSPopupMenu.Builder = function() {
  /** @type {{ label?: string, iconPath?: string, itemSelectedListener?: function(), subItems?: {}[] }[] } } */
  this.items = [];
}
JSPopupMenu.Builder.prototype = Object.create(JSPopupMenu.Builder.prototype);
JSPopupMenu.Builder.prototype.constructor = JSPopupMenu.Builder;

/**
 * Add a checkable item
 * @param {string} label
 * @param {function()} [itemSelectedListener]
 * @param {boolean} [checked]
 */
JSPopupMenu.Builder.prototype.addCheckBoxItem = function(label, itemSelectedListener, checked) {
  this.addNewMenuItem(label, undefined, itemSelectedListener, checked === true, "checkbox");
}

/**
 * Add a radio button item
 * @param {string} label
 * @param {function()} [itemSelectedListener]
 * @param {boolean} [checked]
 */
JSPopupMenu.Builder.prototype.addRadioButtonItem = function(label, itemSelectedListener, checked) {
  this.addNewMenuItem(label, undefined, itemSelectedListener, checked === true, "radiobutton");
}

/**
 * Adds an item to this menu using either a ResourceAction, or icon (optional), label & callback.
 * 1) builder.addMenuItem(pane.getAction(MyPane.ActionType.MY_ACTION))
 * 2) builder.addMenuItem('resources/icons/tango/media-skip-forward.png', "myitem", function() { console.log('my item clicked') })
 * 3) builder.addMenuItem("myitem", function() { console.log('my item clicked') })
 * @param {ResourceAction|string} actionOrIconPathOrLabel
 * @param {string|function()} [itemSelectedListenerOrLabel]
 * @param {function()} [itemSelectedListener]
 * @return {JSPopupMenu.Builder}
 */
JSPopupMenu.Builder.prototype.addMenuItem = function(actionOrIconPathOrLabel, itemSelectedListenerOrLabel, itemSelectedListener) {
  var label = null;
  var iconPath = null;
  var itemSelectedListener = null;
  // Defined only for a check action
  var checked = undefined;
  // Defined only for a toggle action
  var selected = undefined;

  if (actionOrIconPathOrLabel instanceof ResourceAction) {
    var action = actionOrIconPathOrLabel;
    // Do no show item if action is disabled
    if (!action.isEnabled() || action.getValue(ResourceAction.VISIBLE) === false) {
      return this;
    }

    iconPath = action.getURL(AbstractAction.SMALL_ICON);
    label = action.getValue(ResourceAction.POPUP) || action.getValue(AbstractAction.NAME);

    if (action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP)) {
      selected = action.getValue(AbstractAction.SELECTED_KEY);
    }
    itemSelectedListener = function() {
        action.actionPerformed();
      };
  } else if (typeof itemSelectedListener == "function") {
    iconPath = actionOrIconPathOrLabel;
    label = itemSelectedListenerOrLabel;
    itemSelectedListener = itemSelectedListener;
  } else {
    label = actionOrIconPathOrLabel;
    itemSelectedListener = itemSelectedListenerOrLabel;
  }

  this.addNewMenuItem(label, iconPath, itemSelectedListener, selected, selected !== undefined ? "radiobutton" : undefined);
  return this;
}

/**
 * @param {string} label
 * @param {string | undefined} [iconPath]
 * @param {function() | undefined} [itemSelectedListener]
 * @param {boolean | undefined} [selected]
 * @param {"radiobutton" | "checkbox" | undefined} [mode]
 * @private
 */
JSPopupMenu.Builder.prototype.addNewMenuItem = function(label, iconPath, itemSelectedListener, selected, mode) {
  this.items.push({
      label: label,
      iconPath: iconPath,
      itemSelectedListener: itemSelectedListener,
      selected: selected,
      mode: mode
    });
}

/**
 * Adds a sub menu to this menu.
 * @param {ResourceAction|string} action
 * @param {function(JSPopupMenu.Builder)} buildSubMenu
 * @return {JSPopupMenu.Builder}
 */
JSPopupMenu.Builder.prototype.addSubMenu = function(action, buildSubMenu) {
  // Do no show item if action is disabled
  if (action.isEnabled()) {
    var label = action.getValue(ResourceAction.POPUP) || action.getValue(AbstractAction.NAME);
    var iconPath = action.getURL(AbstractAction.SMALL_ICON);
    var subMenuBuilder = new JSPopupMenu.Builder();
    buildSubMenu(subMenuBuilder);
    var subItems = subMenuBuilder.items;
    if (subItems.length > 0) {
      this.items.push({
          label: label,
          iconPath: iconPath,
          subItems: subItems
        });
    }
  }

  return this;
}

JSPopupMenu.CONTEXT_MENU_SEPARATOR_ITEM = {};

/**
 * Adds a separator after previous items.
 * Does nothing if there are no items yet or if the latest added item is already a separator.
 * @return {JSPopupMenu.Builder}
 */
JSPopupMenu.Builder.prototype.addSeparator = function() {
  if (this.items.length > 0 && this.items[this.items.length - 1] != JSPopupMenu.CONTEXT_MENU_SEPARATOR_ITEM) {
    this.items.push(JSPopupMenu.CONTEXT_MENU_SEPARATOR_ITEM);
  }
  return this;
}


// Global initializations of the toolkit
if (!JSPopupMenu.globalCloserRegistered) {
  var listener = function(ev) {
      if (JSPopupMenu.current != null
        && !JSComponent.isElementContained(ev.target, JSPopupMenu.current.getHTMLElement())) {
        // Clicked outside menu
        if (JSPopupMenu.closeOpenedMenu()) {
          ev.stopPropagation();
          ev.preventDefault();
        }
      }
    };
  window.addEventListener("click", listener);
  window.addEventListener("touchstart", listener);
  
  document.addEventListener("keydown", function(ev) {
      if (ev.key == "Escape" || ev.keyCode == 27) {
        if (!JSComboBox.closeOpenedSelectionPanel()) {
          JSDialog.closeTopMostDialog();
          JSPopupMenu.closeOpenedMenu();
        }
      } else if (ev.keyCode == 13 && JSDialog.getTopMostDialog() != null) {
        var defaultCapableButton = JSDialog.getTopMostDialog().findElement(".default-capable");
        if (defaultCapableButton != null) {
          defaultCapableButton.click();
        }
      }
    });

  JSPopupMenu.globalCloserRegistered = true;
}


/**
 * A spinner component with -+ buttons able to decrease / increase edtied value.
 * @param {UserPreferences} preferences the current user preferences
 * @param {HTMLElement} spanElement span element on which the spinner is installed
 * @param {{format?: Format, nullable?: boolean, value?: number, minimum?: number, maximum?: number, stepSize?: number}} [options]
 * - format: number format to be used for this input - default to DecimalFormat for current content
 * - nullable: false if null/undefined is not allowed - default false
 * - value: initial value,
 * - minimum: minimum number value,
 * - maximum: maximum number value,
 * - stepSize: step between values when increment / decrement using UI - default 1
 * @constructor
 * @extends JSComponent
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function JSSpinner(preferences, spanElement, options) {
  if (spanElement.tagName.toUpperCase() != "SPAN") {
    throw new Error("JSSpinner: please provide a span for the spinner to work - " + spanElement + " is not a span");
  }

  if (!options) { 
    options = {}; 
  }
  this.checkMinimumMaximum(options.minimum, options.maximum);

  if (!isNaN(parseFloat(options.minimum))) { 
    this.minimum = options.minimum;
  }
  if (!isNaN(parseFloat(options.maximum))) { 
    this.maximum = options.maximum;
  }
  if (isNaN(parseFloat(options.stepSize))) { 
    this.stepSize = 1; 
  } else {
    this.stepSize = options.stepSize;
  }
  if (typeof options.nullable == "boolean") { 
    this.nullable = options.nullable;
  } else {
    this.nullable = false; 
  }
  if (options.format instanceof Format) { 
    this.format = options.format;
  } else {
    this.format = new DecimalFormat(); 
  }

  var component = this;
  JSComponent.call(this, preferences, spanElement, true);

  spanElement.classList.add("spinner");
  
  this.textInput = document.createElement("input");
  this.textInput.type = "text";
  spanElement.appendChild(this.textInput);

  this.registerEventListener(this.textInput, "focus", function(ev) {
      component.updateUI();
    });
  this.registerEventListener(this.textInput, "focusout", function(ev) {
      component.updateUI();
    });

  this.registerEventListener(this.textInput, "input", function(ev) {
      if (component.isFocused()) {
        var pos = new ParsePosition(0);
        var inputValue = component.parseValueFromInput(pos);
        if (pos.getIndex() != component.textInput.value.length
            || inputValue == null && !component.nullable
            || (component.minimum != null && inputValue < component.minimum) 
            || (component.maximum != null && inputValue > component.maximum)) {
          component.textInput.style.color = "red";
        } else {
          component.textInput.style.color = null;
          component.value = inputValue;
        }
      }
    });

  this.registerEventListener(this.textInput, "blur", function(ev) {
      var inputValue = component.parseValueFromInput();
      if (inputValue == null && !component.nullable) {
        var restoredValue = component.value;
        if (restoredValue == null) {
          restoredValue = component.getDefaultValue();
        }
        inputValue = restoredValue;
      }
      component.textInput.style.color = null;
      component.setValue(inputValue);
    });

  this.initIncrementDecrementButtons(spanElement);

  Object.defineProperty(this, "width", {
      get: function() { return spanElement.style.width; },
      set: function(value) { spanElement.style.width = value; }
    });
  Object.defineProperty(this, "parentElement", {
      get: function() { return spanElement.parentElement; }
    });
  Object.defineProperty(this, "previousElementSibling", {
      get: function() { return spanElement.previousElementSibling; }
    });
  Object.defineProperty(this, "style", {
      get: function() { return spanElement.style; }
    });

  this.setValue(options.value);
}
JSSpinner.prototype = Object.create(JSComponent.prototype);
JSSpinner.prototype.constructor = JSSpinner;

/**
 * @return {Object} the value of this spinner
 */
JSSpinner.prototype.getValue = function() {
  return this.value;
}

/**
 * @param {Object} value the value of this spinner
 */
JSSpinner.prototype.setValue = function(value) {
  if (value instanceof Big) {
    value = parseFloat(value);
  }
  if (value != null && typeof value != "number") {
    throw new Error("JSSpinner: Expected values of type number");
  }
  if (value == null && !this.nullable) {
    value = this.getDefaultValue();
  }
  if (value != null && this.minimum != null && value < this.minimum) {
    value = this.minimum;
  }
  if (value != null && this.maximum != null && value > this.maximum) {
    value = this.maximum;
  }

  if (value != this.value) {
    this.value = value;
    this.updateUI();
  }
}

/**
 * @return {number} minimum of this spinner
 * @private
 */
JSSpinner.prototype.checkMinimumMaximum = function(minimum, maximum) {
  if (minimum != null && maximum != null && minimum > maximum) {
    throw new Error("JSSpinner: minimum is not below maximum - minimum = " + minimum + " maximum = " + maximum);
  }
}

/**
 * @return {boolean} <code>true</code> if this spinner may contain no value
 */
JSSpinner.prototype.isNullable = function() {
  return this.nullable;
}

/**
 * @param {boolean} nullable <code>true</code> if this spinner may contain no value
 */
JSSpinner.prototype.setNullable = function(nullable) {
  var containsNullValue = this.nullable && this.value === null;
  this.nullable = nullable;
  if (!nullable && containsNullValue) {
    this.value = this.getDefaultValue();
  }
}

/**
 * @return {Format} format used to format the value of this spinner
 */
JSSpinner.prototype.getFormat = function() {
  return this.format;
}

/**
 * @param {Format} format  format used to format the value of this spinner
 */
JSSpinner.prototype.setFormat = function(format) {
  this.format = format;
  this.updateUI();
}

/**
 * @return {number} minimum of this spinner
 */
JSSpinner.prototype.getMinimum = function() {
  return this.minimum;
}

/**
 * @param {number} minimum minimum value of this spinner
 */
JSSpinner.prototype.setMinimum = function(minimum) {
  this.checkMinimumMaximum(minimum, this.maximum);
  this.minimum = minimum; 
}

/**
 * @return {number} minimum of this spinner
 */
JSSpinner.prototype.getMinimum = function() {
  return this.minimum;
}

/**
 * @param {number} minimum minimum value of this spinner
 */
JSSpinner.prototype.setMinimum = function(minimum) {
  this.checkMinimumMaximum(minimum, this.maximum);
  this.minimum = minimum; 
}

/**
 * @return {number} maximum of this spinner
 */
JSSpinner.prototype.getMaximum = function() {
  return this.maximum;
}

/**
 * @param {number} maximum maximum value of this spinner
 */
JSSpinner.prototype.setMaximum = function(maximum) {
  this.checkMinimumMaximum(this.minimum, maximum);
  this.maximum = maximum; 
}

/**
 * @return {number} step size of this spinner
 */
JSSpinner.prototype.getStepSize = function() {
  return this.stepSize;
}

/**
 * @param {number} stepSize step size of this spinner
 */
JSSpinner.prototype.setStepSize = function(stepSize) {
  this.stepSize = stepSize; 
}

/**
 * @return {HTMLInputElement} underlying input element
 */
JSSpinner.prototype.getInputElement = function() {
  return this.textInput;
}

JSSpinner.prototype.addEventListener = function() {
  return this.textInput.addEventListener.apply(this.textInput, arguments);
}

JSSpinner.prototype.removeEventListener = function() {
  return this.textInput.removeEventListener.apply(this.textInput, arguments);
}

/**
 * Refreshes UI for current state / options. For instance, if format has changed, displayed text is updated.
 * @private
 */
JSSpinner.prototype.updateUI = function() {
  this.textInput.value = this.formatValueForUI(this.value);
}

/**
 * @param {ParsePosition} [parsePosition]
 * @return {number}
 * @private
 */
JSSpinner.prototype.parseValueFromInput = function(parsePosition) {
  if (!this.textInput.value || this.textInput.value.trim() == "") {
    if (this.nullable) {
      return null;
    } else {
      return this.value;
    }
  }
  return this.format.parse(this.textInput.value, 
      parsePosition != undefined ? parsePosition : new ParsePosition(0));
}

/**
 * @return {number}
 * @private
 */
JSSpinner.prototype.getDefaultValue = function() {
  var defaultValue = 0;
  if (this.minimum != null && this.minimum > defaultValue) {
    defaultValue = this.minimum;
  }
  if (this.maximum != null && this.maximum < defaultValue) {
    defaultValue = this.maximum;
  }
  return defaultValue;
}

/**
 * @param {number} value
 * @return {string}
 * @private
 */
JSSpinner.prototype.formatValueForUI = function(value) {
  if (value == null) {
    return "";
  }

  if (!this.isFocused()) {
    return this.format.format(value);
  }
  if (this.noGroupingFormat == null || this.lastFormat !== this.format) {
    // Format changed, compute focused format
    this.lastFormat = this.format;
    this.noGroupingFormat = this.lastFormat.clone();
    this.noGroupingFormat.setGroupingUsed(false);
  }
  return this.noGroupingFormat.format(value);
}

/**
 * @return {boolean} true if this spinner has focus
 * @private
 */
JSSpinner.prototype.isFocused = function() {
  return this.textInput === document.activeElement;
}

/**
 * Creates and initialize increment & decrement buttons + related keystrokes.
 * @private
 */
JSSpinner.prototype.initIncrementDecrementButtons = function(spanElement) {
  var component = this;
  this.incrementButton = document.createElement("button");
  this.incrementButton.setAttribute("increment", "");
  this.incrementButton.textContent = "+";
  this.incrementButton.tabIndex = -1;
  spanElement.appendChild(this.incrementButton);

  this.decrementButton = document.createElement("button");
  this.decrementButton.setAttribute("decrement", "");
  this.decrementButton.textContent = "-";
  this.decrementButton.tabIndex = -1;
  spanElement.appendChild(this.decrementButton);

  var incrementValue = function(ev) {
      var previousValue = component.value;
      if (previousValue == null || isNaN(previousValue)) {
        previousValue = component.getDefaultValue();
      }
      component.setValue(previousValue + component.stepSize);
      component.fireInputEvent();
    };
  var decrementValue = function(ev) {
      var previousValue = component.value;
      if (previousValue == null || isNaN(previousValue)) {
        previousValue = component.getDefaultValue();
      }
      component.setValue(previousValue - component.stepSize);
      component.fireInputEvent();
    };

  // Repeat incrementValue / decrementValue every 80 ms with an initial delay of 400 ms
  // while mouse button kept pressed, and ensure at least one change is triggered for a short click
  var repeatAction = function(ev, button, action) {
      if (component.isFocused()) {
        ev.preventDefault(); // Prevent input from losing focus 
      }
      var stopRepeatedTask = function(ev) {
          clearTimeout(taskId);
          button.removeEventListener("mouseleave", stopRepeatedTask);
          button.removeEventListener("mouseup", stopRepeatedTask);
        };
      var clickAction = function(ev) {
          clearTimeout(taskId);
          button.removeEventListener("click", clickAction);
          action();
        };
      button.addEventListener("click", clickAction);
      var repeatedTask = function() {
          action();
          taskId = setTimeout(repeatedTask, 80); 
        };
      var taskId = setTimeout(function() {
          button.removeEventListener("click", clickAction);
          button.addEventListener("mouseleave", stopRepeatedTask);
          button.addEventListener("mouseup", stopRepeatedTask);
          repeatedTask();
        }, 400);
    };
  var repeatIncrementValue = function(ev) {
      repeatAction(ev, component.incrementButton, incrementValue);
    };
  this.registerEventListener(component.incrementButton, "mousedown", repeatIncrementValue);
  
  var repeatDecrementValue = function(ev) {
      repeatAction(ev, component.decrementButton, decrementValue);
    };
  this.registerEventListener(component.decrementButton, "mousedown", repeatDecrementValue);

  this.registerEventListener(component.textInput, "keydown", function(ev) {
      var keyStroke = KeyStroke.getKeyStrokeForEvent(ev, "keydown");
      if (keyStroke.lastIndexOf(" UP") > 0) {
        ev.stopImmediatePropagation();
        incrementValue();
      } else if (keyStroke.lastIndexOf(" DOWN") > 0) {
        ev.stopImmediatePropagation();
        decrementValue();
      }
    });
  this.registerEventListener(this.textInput, "focus", function(ev) {
      component.updateUI();
    });
}

/**
 * Fires an "input" event on behalf of underlying text input.
 * @private
 */
JSSpinner.prototype.fireInputEvent = function() {
  var ev = document.createEvent("Event");
  ev.initEvent("input", true, true);
  this.textInput.dispatchEvent(ev);
}

/**
 * Enables or disables this component.
 * @param {boolean} enabled
 */
JSSpinner.prototype.setEnabled = function(enabled) {
  this.textInput.disabled = !enabled;
  this.incrementButton.disabled = !enabled;
  this.decrementButton.disabled = !enabled;
}


/**
 * A combo box component which allows any type of content (e.g. images).
 * @param {UserPreferences} preferences the current user preferences
 * @param {HTMLElement} selectElement HTML element on which install this component
 * @param {{nullable?: boolean, value?: any, availableValues: (any)[], renderCell?: function(value: any, element: HTMLElement), selectionChanged: function(newValue: any)}} [options]
 * - nullable: false if null/undefined is not allowed - default false
 * - value: initial value - default undefined if nullable or first available value,
 * - availableValues: available values in this combo,
 * - renderCell: a function which builds displayed element for a given value - defaults to setting textContent to value.toString()
 * - selectionChanged: called with new value when selected by user
 * @constructor
 * @extends JSComponent
 * @author Louis Grignon
 */
function JSComboBox(preferences, selectElement, options) {
  JSComponent.call(this, preferences, selectElement, true);
  
  if (!options) { 
    options = {}; 
  }
  if (typeof options.nullable != "boolean") { 
    options.nullable = false; 
  }
  if (!Array.isArray(options.availableValues) || options.availableValues.length <= 0) {
    throw new Error("JSComboBox: No available values provided");
  }
  if (typeof options.renderCell != "function") {
    options.renderCell = function(value, element) {
        element.textContent = value == null ? "" : value.toString();
      };
  }
  if (options.value == null && !options.nullable) {
    options.value = options.availableValues[0];
  }

  this.options = options;

  selectElement.classList.add("combo-box");

  this.button = document.createElement("button");
  selectElement.appendChild(this.button);

  this.preview = document.createElement("div");
  this.preview.classList.add("preview");
  this.button.appendChild(this.preview);

  this.initSelectionPanel();
  var component = this;
  this.registerEventListener(this.button, "click", function(ev) {
      ev.stopImmediatePropagation();
      component.openSelectionPanel(ev.pageX, ev.pageY);
    });

  this.setSelectedItem(options.value);
}
JSComboBox.prototype = Object.create(JSComponent.prototype);
JSComboBox.prototype.constructor = JSComboBox;

/**
 * @private
 */
JSComboBox.prototype.initSelectionPanel = function() {
  var selectionPanel = document.createElement("div");
  selectionPanel.classList.add("selection-panel");

  for (var i = 0; i < this.options.availableValues.length; i++) {
    var currentItemElement = document.createElement("div");
    currentItemElement.value = this.options.availableValues[i];
    this.options.renderCell(currentItemElement.value, currentItemElement);
    selectionPanel.appendChild(currentItemElement);
  }

  this.getHTMLElement().appendChild(selectionPanel);
  this.selectionPanel = selectionPanel;

  var component = this;
  this.registerEventListener(selectionPanel.children, "click", function(ev) {
      component.selectedItem = this.value;
      component.updateUI();
      if (typeof component.options.selectionChanged == "function") {
        component.options.selectionChanged(component.selectedItem);
      }
    });
  this.registerEventListener(this.selectionPanel, "focusout", function(ev) {
      comboBox.closeSelectionPanel();
    });
}

/**
 * @return {number} the value selected in this combo box
 */
JSComboBox.prototype.getSelectedItem = function() {
  return this.selectedItem;
}

/**
 * @param {number} selectedItem  the value to select in this combo box
 */
JSComboBox.prototype.setSelectedItem = function(selectedItem) {
  var isValueAvailable = false;
  for (var i = 0; i < this.options.availableValues.length; i++) {
    if (this.areValuesEqual(selectedItem, this.options.availableValues[i])) {
      isValueAvailable = true;
      break;
    }
  }
  if (!isValueAvailable) {
    selectedItem = null;
  }

  if (selectedItem == null && !this.options.nullable) {
    selectedItem = this.options.availableValues[0];
  }

  if (!this.areValuesEqual(selectedItem, this.selectedItem)) {
    this.selectedItem = selectedItem;
    this.updateUI();
  }
}

/**
 * Enables or disables this combo box.
 * @param {boolean} enabled 
 */
JSComboBox.prototype.setEnabled = function(enabled) {
  this.button.disabled = !enabled;
}

/**
 * Opens the combo box's selection panel.
 * @param {number} pageX
 * @param {number} pageY
 * @private
 */
JSComboBox.prototype.openSelectionPanel = function(pageX, pageY) {
  if (JSComboBox.current != null) {
    JSComboBox.current.closeSelectionPanel();
  }
  
  var comboBox = this;
  this.closeSelectionPanelListener = function() {
      comboBox.closeSelectionPanel();
    }

  this.selectionPanel.style.display = "block";
  this.selectionPanel.style.opacity = 1;
  this.selectionPanel.style.left = (pageX + this.selectionPanel.clientWidth > window.width ? window.width - this.selectionPanel.clientWidth : pageX) + "px";
  this.selectionPanel.style.top = (pageY + this.selectionPanel.clientHeight > window.innerHeight ? window.innerHeight - this.selectionPanel.clientHeight : pageY) + "px";
  window.addEventListener("click", this.closeSelectionPanelListener);
  JSComboBox.current = this;
}

/**
 * Closes the combo box's selection panel.
 * @private
 */
JSComboBox.prototype.closeSelectionPanel = function() {
  window.removeEventListener("click", this.closeSelectionPanelListener);
  this.selectionPanel.style.opacity = 0;
  this.selectionPanel.style.display = "none";
  this.closeSelectionPanelListener = null;
  JSComboBox.current = null;
}

/**
 * Closes currently displayed selection panel if any.
 * @static
 * @ignored
 */
JSComboBox.closeOpenedSelectionPanel= function() {
  if (JSComboBox.current != null) {
    JSComboBox.current.closeSelectionPanel();
    return true;
  }
  return false;
}

/**
 * Refreshes UI, i.e. preview of selected value.
 */
JSComboBox.prototype.updateUI = function() {
  this.preview.innerHTML = "";
  this.options.renderCell(this.getSelectedItem(), this.preview);
}

/**
 * Checks if value1 and value2 are equal. Returns true if so.
 * NOTE: this internally uses JSON.stringify to compare values
 * @return {boolean}
 * @private
 */
JSComboBox.prototype.areValuesEqual = function(value1, value2) {
  return JSON.stringify(value1) == JSON.stringify(value2);
}


/*
 * @typedef {{
 *   visibleColumnNames?: string[],
 *   expandedRowsIndices?: number[],
 *   expandedRowsValues?: any[],
 *   sort?: { columnName: string, direction: "asc" | "desc" }
 * }} TreeTableState
 * @property TreeTableState.expandedRowsIndices index in filtered and sorted rows, expandedRowsValues can also be used but not both (expandedRowsValues will be preferred)
 * @property TreeTableState.expandedRowsValues expanded rows listed by their values. It takes precedence over expandedRowsIndices but achieves the same goal
 */
/*
 * @typedef {{
 *   columns: {
 *       name: string,
 *       orderIndex: number,
 *       label: string,
 *       defaultWidth?: string
 *   }[],
 *   renderCell: function(value: any, columnName: string, cell: HTMLElement): void,
 *   getValueComparator: function(sortConfig?: { columnName: string, direction: "asc" | "desc" }): function(value1: any, value2: any),
 *   selectionChanged: function(values: any[]): void,
 *   rowDoubleClicked: function(value: any): void,
 *   expandedRowsChanged: function(expandedRowsValues: any[], expandedRowsIndices: number[]): void,
 *   sortChanged: function(sort: { columnName: string, direction: "asc" | "desc" }): void,
 *   initialState?: TreeTableState
 * }} TreeTableModel
 * @property TreeTableModel.renderCell render cell to given html element for given value, column name
 * @property TreeTableModel.selectionChanged called when a row selection changes, passing updated selected values
 * @property TreeTableModel.rowDoubleClicked called when a row is double clicked, passing row's value
 */

/**
 * A flexible tree table which allows grouping (tree aspect), sorting, some inline edition, single/multi selection, contextual menu, copy/paste.
 * @param {HTMLElement} container html element on which this component is installed
 * @param {UserPreferences} preferences the current user preferences
 * @param {TreeTableModel} model table's configuration
 * @param {{value: any, children: {value, children}[] }[]} [data] data source for this tree table - defaults to empty data
 * @constructor
 * @extends JSComponent
 * @author Louis Grignon
 */
function JSTreeTable(container, preferences, model, data) {
  JSComponent.call(this, preferences, container, true);
  
  /**
   * @type {TreeTableState}
   */
  this.state = {};
  this.selectedRowsValues = [];
  
  this.tableElement = document.createElement("div");
  this.tableElement.classList.add("tree-table");
  container.appendChild(this.tableElement);
  this.setModel(model);
  this.setData(data ? data : []);
}
JSTreeTable.prototype = Object.create(JSComponent.prototype);
JSTreeTable.prototype.constructor = JSTreeTable;

/**
 * Sets data and updates rows in UI.
 * @param {{value: any, children: {value, children}[] }[]} data
 */
JSTreeTable.prototype.setData = function(data) {
  this.data = data;

  var expandedRowsValues = this.getExpandedRowsValues();
  if (expandedRowsValues != null) {
    this.updateState({
        expandedRowsValues: expandedRowsValues
      });
  }

  if (this.isDisplayed()) {
    this.generateTableRows();
    this.fireExpandedRowsChanged();
  }
}

/**
 * Updates in UI the data of the row matching the given value.
 * @param {any} value
 * @param {string} [columnName] name of the column which may have changed 
 */
JSTreeTable.prototype.updateRowData = function(value, columnName) {
  if (this.isDisplayed()) {
    if (!this.state.sort 
        || this.state.sort.columnName == null
        || (columnName !== undefined && this.state.sort.columnName != columnName)) {
      var columnNames = this.getColumnNames();
      var columnIndex = columnName !== undefined
          ? columnNames.indexOf(columnName)
          : 0;
      if (columnIndex >= 0) {
        var rows = this.bodyElement.children;
        for (i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (row._model.value === value) {
            if (columnName !== undefined) {
              this.model.renderCell(value, columnName, row.children[columnIndex]);
            } else {
              for (var j = 0; j < columnNames.length; j++) {
                this.model.renderCell(value, columnNames[j], row.children[j]);
              }
            }
            break;
          }
        }
      }
    } else {
      this.generateTableRows();
    }
  }
}

/**
 * Gets current table data
 * @return {{value: any, children: {value, children}[] }[]}
 */
JSTreeTable.prototype.getData = function() {
  return this.data;
}

/**
 * @param {TreeTableModel} model
 */
JSTreeTable.prototype.setModel = function(model) {
  this.model = model;

  this.updateState(model.initialState);
  this.columnsWidths = this.getColumnsWidthByName();

  if (this.isDisplayed()) {
    this.generateTableHeaders();
    this.generateTableRows();
  }
}

/**
 * @private
 */
JSTreeTable.prototype.isDisplayed = function() {
  return window.getComputedStyle(this.getHTMLElement()).display != "none";
}

/**
 * @param {any[]} values
 */
JSTreeTable.prototype.setSelectedRowsByValue = function(values) {
  this.selectedRowsValues = values.slice(0);
  if (this.isDisplayed()) {
    this.expandGroupOfSelectedRows(values);
    var rows = this.bodyElement.children;
    // Unselect all
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      row._model.selected = false;
      row.classList.remove("selected");
    }
    // Select values
    for (var i = 0; i < values.length; i++) {
      for (var j = 0; j < rows.length; j++) {
        var row = rows[j];
        if (row._model.value === values [i]) {
          this.selectRowAt(j);
          break;
        }
      }
    }
    this.scrollToSelectedRowsIfNotVisible();
  }
}

/**
 * Selects the row at the given <code>index</code> and its children.
 * @param {number} index
 * @private
 */
JSTreeTable.prototype.selectRowAt = function(index) {
  var rows = this.bodyElement.children;
  var row = rows[index];
  row._model.selected = true;
  row.classList.add("selected");
  if (row._model.group
      && row._model.collapsed === false) {
    // Change children selection of expanded group
    for (var i = index + 1; i < rows.length; i++) {
      var childrenRow = rows[i];
      if (childrenRow._model.parentGroup
          && childrenRow._model.parentGroup.value === row._model.value) {
        this.selectRowAt(i);
      }
    }
  }
}
  
/**
 * Expands the parents of the given values when they are collapsed.
 * @private
 */
JSTreeTable.prototype.expandGroupOfSelectedRows = function(values) {
  if (this.isDisplayed()) {
    var rows = this.bodyElement.children;
    for (var i = 0; i < values.length; i++) {
      for (var j = 0; j < rows.length; j++) {
        var row = rows[j];
        if (row._model.value === values [i]) {
          if (row._model.hidden) {
            this.expandOrCollapseRow(row._model.parentGroup, true);
            // Find parent group
            for (var k = j - 1; k >= 0; k--) {
              if (row._model.parentGroup.value === rows[k]._model.value) {
                rows[k]._model.collapsed = false;
                rows[k].classList.remove("collapsed");
                // Make sibling rows visible
                for (k++; k < rows.length; k++) {
                  var childrenRow = rows[k];
                  if (childrenRow._model.parentGroup
                      && childrenRow._model.parentGroup.value === row._model.parentGroup.value) {
                    childrenRow._model.hidden = false;
                    childrenRow.style.display = "flex";
                  }
                }
                if (row._model.parentGroup.parentGroup) {
                  this.expandGroupOfSelectedRows([row._model.parentGroup.value]);
                }
                break;
              } 
            }
          }
          break;
        }
      }
    }
  }
}

/**
 * @private
 */
JSTreeTable.prototype.scrollToSelectedRowsIfNotVisible = function() {
  var selectedRows = this.bodyElement.querySelectorAll(".selected");
  if (selectedRows.length > 0) {
    // If one selected row is visible, do not change scroll
    for (var i = 0; i < selectedRows.length; i++) {
      var selectedRow = selectedRows[i];
      var rowTop = selectedRow.offsetTop - this.bodyElement.offsetTop;
      var rowBottom = rowTop + selectedRow.clientHeight;
      if (rowTop >= this.bodyElement.scrollTop && rowBottom <= (this.bodyElement.scrollTop + this.bodyElement.clientHeight)) {
        return;
      }
    }

    this.bodyElement.scrollTop = selectedRows[0].offsetTop - this.bodyElement.offsetTop;
  }
}

/**
 * @return {any[]} expanded rows by their values
 * @private
 */
JSTreeTable.prototype.getExpandedRowsValues = function() {
  if (this.state && this.state.expandedRowsValues) {
    return this.state.expandedRowsValues;
  }
  return undefined;
}

/**
 * @private
 */
JSTreeTable.prototype.fireExpandedRowsChanged = function() {
  if (this.state.expandedRowsValues != null) {
    this.updateExpandedRowsIndices();
    this.model.expandedRowsChanged(this.state.expandedRowsValues, this.state.expandedRowsIndices);
  }
}

/**
 * Refreshes expandedRowsIndices from expandedRowsValues
 * @private
 */
JSTreeTable.prototype.updateExpandedRowsIndices = function() {
  if (this.state.expandedRowsValues != null 
      && this.data != null 
      && this.data.sortedList != null) {
    this.state.expandedRowsIndices = [];
    for (var i = 0; i < this.data.sortedList.length; i++) {
      var value = this.data.sortedList[i].value;
      if (this.state.expandedRowsValues.indexOf(value) > -1) {
        this.state.expandedRowsIndices.push(i);
      }
    }
  }
}

/**
 * @private
 */
JSTreeTable.prototype.fireSortChanged = function() {
  if (this.state.sort != null) {
    this.model.sortChanged(this.state.sort);
  }
}

/**
 * @param {Partial<TreeTableState>} [stateProperties]
 * @private
 */
JSTreeTable.prototype.updateState = function(stateProperties) {
  if (stateProperties) {
    CoreTools.merge(this.state, stateProperties);
  }
}

/**
 * @return {function(value1: any, value2: any)}
 * @private
 */
JSTreeTable.prototype.getValueComparator = function() {
  return this.model.getValueComparator(this.state.sort);
}

/**
 * @private
 */
JSTreeTable.prototype.generateTableHeaders = function() {
  var treeTable = this;

  var head = this.tableElement.querySelector("[header]");
  if (!head) {
    head = document.createElement("div");
    head.setAttribute("header", "true");
    this.tableElement.appendChild(head);
    this.tableElement.appendChild(document.createElement("br"));
  }
  head.innerHTML = "";

  var columns = this.getColumns();
  for (var i = 0; i < columns.length; i++) {
    var column = columns[i];
    var headCell = document.createElement("div");
    head.appendChild(headCell);
    headCell.setAttribute("cell", "true");
    headCell.textContent = column.label;
    headCell.dataset["name"] = column.name;
    if (this.state.sort && this.state.sort.columnName == column.name) {
      headCell.classList.add("sort");
      if (this.state.sort.direction == "desc") {
        headCell.classList.add("descending");
      }
    }

    headCell.style.width = treeTable.getColumnWidth(column.name);
  }
  this.registerEventListener(head.children, "click", function(ev) {
      var columnName = this.dataset["name"];
      var descending = this.classList.contains("sort") && !this.classList.contains("descending");
      treeTable.sortTable(columnName, descending);
    });
}

/**
 * @private
 */
JSTreeTable.prototype.generateTableRows = function() {
  var treeTable = this;
  var tableRowsGenerator = function() {
      var scrollTop = 0;
      if (treeTable.bodyElement) {
        scrollTop = treeTable.bodyElement.scrollTop;
        treeTable.bodyElement.parentElement.removeChild(treeTable.bodyElement);
      }
      treeTable.bodyElement = document.createElement("div");
      treeTable.bodyElement.setAttribute("body", "true");
    
      // Generate simplified table model: a sorted list of items
      var sortedList = treeTable.data.sortedList = [];
      var comparator = treeTable.getValueComparator();
    
      /**
       * @param {{value: any, children: any[]}[]} currentNodes
       * @param {number} currentIndentation
       * @param {any} [parentGroup]
       * @return {Object[]} generated children items
       */
      var sortDataTree = function(currentNodes, currentIndentation, parentGroup) {
          // Children nodes are hidden by default, and will be flagged as visible with setCollapsed, see below
          var hideChildren = currentIndentation > 0;
          var sortedCurrentNodes = comparator != null
              ? currentNodes.sort(function(leftNode, rightNode) {
                    return comparator(leftNode.value, rightNode.value);
                  })
              : currentNodes;
          var currentNodesItems = [];
          for (var i = 0; i < sortedCurrentNodes.length; i++) {
            var currentNode = sortedCurrentNodes[i];
            var currentNodeSelected = treeTable.selectedRowsValues.indexOf(currentNode.value) > -1;
            var selected = (parentGroup && parentGroup.selected) || currentNodeSelected;
            var sortedListItem = {
              value: currentNode.value,
              indentation: currentIndentation,
              group: false,
              parentGroup: parentGroup,
              selected: selected,
              hidden: hideChildren,
              collapsed: undefined,
              childrenItems: undefined,
              setCollapsed: function() {},
              isInCollapsedGroup: function() {
                var parent = this;
                while ((parent = parent.parentGroup)) {
                  if (parent.collapsed === true) {
                    return true;
                  }
                }
                return false;
              }
            };
            currentNodesItems.push(sortedListItem);
            sortedList.push(sortedListItem);
      
            // Create node's children items
            if (Array.isArray(currentNode.children) && currentNode.children.length > 0) {
              sortedListItem.group = true;
              sortedListItem.collapsed = true;
              sortedListItem.childrenItems = sortDataTree(currentNode.children, currentIndentation + 1, sortedListItem);
              sortedListItem.setCollapsed = (function(item) {
                  return function(collapsed) {
                    item.collapsed = collapsed;
                    for (var i = 0; i < item.childrenItems.length; i++) {
                      item.childrenItems[i].hidden = collapsed;
                    }
                  }
                })(sortedListItem);
            }
          }
      
          return currentNodesItems;
        };
      sortDataTree(treeTable.data.slice(0), 0);
    
      // Synchronize expandedRowsIndices/expandedRowsValues & flag groups as expanded, and children as visible
      treeTable.updateExpandedRowsIndices();
      if (treeTable.state.expandedRowsIndices && treeTable.state.expandedRowsIndices.length > 0) {
        var expandedRowsValues = [];
        for (var i = 0; i < treeTable.state.expandedRowsIndices.length; i++) {
          var item = sortedList[treeTable.state.expandedRowsIndices[i]];
          if (item) {
            expandedRowsValues.push(item.value);
            if (!item.isInCollapsedGroup()) {
              item.setCollapsed(false);
            }
          }
        }
        if (expandedRowsValues.length > 0) {
          treeTable.state.expandedRowsValues = expandedRowsValues;
        }
      }
    
      // Generate DOM for items
      var columnNames = treeTable.getColumnNames();
      for (var i = 0; i < sortedList.length; i++) {
        var row = treeTable.generateRowElement(columnNames, i, sortedList[i]);
        treeTable.bodyElement.appendChild(row);
      }
    
      treeTable.tableElement.appendChild(treeTable.bodyElement);
  
      treeTable.bodyElement.scrollTop = scrollTop;
      delete treeTable.generatingTableRows;
    };
    
  if (this.data) {
    if (treeTable.bodyElement) {
      if (!this.generatingTableRows) {
        // Invoke later table update
        this.generatingTableRows = true;
        setTimeout(tableRowsGenerator, 0);
      }
    } else {
      // Ensure body element exists
      tableRowsGenerator();
    }
  }
}

/**
 * @param {string[]} columnNames
 * @param {number} rowIndex
 * @param {{
        value: any,
        indentation: number,
        group: boolean,
        selected: boolean,
        hidden: boolean,
        collapsed?: boolean,
        childrenItems?: boolean,
        setCollapsed: function(),
    }} rowModel
 * @private
 */
JSTreeTable.prototype.generateRowElement = function(columnNames, rowIndex, rowModel) {
  var treeTable = this;
  var row = document.createElement("div");
  row.setAttribute("row", "true");

  var mainCell = null;
  for (var j = 0; j < columnNames.length; j++) {
    var columnName = columnNames[j];
    var cell = document.createElement("div");
    cell.setAttribute("cell", "true");
    this.model.renderCell(rowModel.value, columnName, cell);
    cell.style.width = this.getColumnWidth(columnName);

    if (mainCell == null || cell.classList.contains("main")) {
      mainCell = cell;
    }

    row.appendChild(cell);
  }

  if (mainCell != null) {
    mainCell.classList.add("main");
    mainCell.style.paddingLeft = (15 + rowModel.indentation * 10) + "px";
    if (rowModel.group) {
      this.registerEventListener(mainCell, "click", function(ev) {
          if (ev.clientX < 16) {
            ev.stopImmediatePropagation();
            var expanded = mainCell.parentElement.classList.contains("collapsed");
            treeTable.expandOrCollapseRow(rowModel, expanded);
            mainCell.parentElement._model.collapsed = !expanded;
            if (expanded) {
              mainCell.parentElement.classList.remove("collapsed");
            } else {
              mainCell.parentElement.classList.add("collapsed");
            }
            var rows = treeTable.bodyElement.children;
            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              var rowCollapsed = rows[i]._model.isInCollapsedGroup();
              if (expanded && rows[i]._model.hidden !== rowCollapsed) {
                rows[i].classList.add("selected");
              }
              rows[i]._model.hidden = rowCollapsed;
              rows[i].style.display = rowCollapsed ? "none" : "flex";
            }
          }
          return false;
        });

      row.classList.add("group");
      if (rowModel.collapsed) {
        row.classList.add("collapsed");
      }
    }
  }
  if (rowModel.hidden) {
    row.style.display = "none";
  }
  if (rowModel.selected) {
    row.classList.add("selected");
  }

  this.registerEventListener(row, "click", function(ev) {
      var row = this;
      var rowValue = row._model.value;
  
      if (OperatingSystem.isMacOSX() ? ev.metaKey : ev.ctrlKey) {
        var index = treeTable.selectedRowsValues.indexOf(rowValue);
        if (index < 0) {
          row.classList.add("selected");
          treeTable.selectedRowsValues.push(rowValue);
        } else {
          row.classList.remove("selected");
          treeTable.selectedRowsValues.splice(index, 1);
        }
      } else {
        row.classList.add("selected");
        treeTable.selectedRowsValues = [rowValue];
      }
      if (typeof treeTable.model.selectionChanged == "function") {
        treeTable.model.selectionChanged(treeTable.selectedRowsValues);
      }
    });
  this.registerEventListener(row, "dblclick", function(ev) {
      if (typeof treeTable.model.rowDoubleClicked == "function") {
        var row = this;
        var rowValue = row._model.value;
        treeTable.model.rowDoubleClicked(rowValue);
      }
    });

  row._model = rowModel;
  return row;
}

/**
 * @param {Object} rowModel
 * @param {boolean} expand true if expanded, false if collapsed
 * @private
 */
JSTreeTable.prototype.expandOrCollapseRow = function(rowModel, expand) {
  var treeTable = this;

  // TODO Test on touch device
  if (treeTable.state.expandedRowsValues == null) {
    treeTable.state.expandedRowsValues = [];
  }
  var index = treeTable.state.expandedRowsValues.indexOf(rowModel.value);
  if (expand) {
    if (index < 0) {
      treeTable.state.expandedRowsValues.push(rowModel.value);
      this.fireExpandedRowsChanged();
    }
  } else {
    if (index >= 0) {
      treeTable.state.expandedRowsValues.splice(index, 1);
      this.fireExpandedRowsChanged();
    }
  }
}

/**
 * @param {string} columnName
 * @param {boolean} descending
 * @private
 */
JSTreeTable.prototype.sortTable = function(columnName, descending) {
  if (!this.state.sort) {
    this.state.sort = {};
  }
  this.state.sort.columnName = columnName;
  this.state.sort.direction = descending ? "desc" : "asc";

  this.fireSortChanged(this.state.sort);
}

/**
 * @param {string} columnName
 * @return {string} css width value, e.g. "2em"
 * @private
 */
JSTreeTable.prototype.getColumnWidth = function(columnName) {
  return this.columnsWidths[columnName];
}

/**
 * @private
 */
JSTreeTable.prototype.getColumns = function() {
  return this.model.columns.slice(0);
}

/**
 * Returns the names of the columns displayed in this table.
 * @return {string[]} 
 * @private
 */
JSTreeTable.prototype.getColumnNames = function() {
  var columnNames = new Array(this.model.columns.length);
  for (var i = 0; i < columnNames.length; i++) {
    columnNames[i] = this.model.columns[i].name;
  }
  return columnNames;
}

/**
 * @return {{[name: string]: string}}
 * @see getColumnWidth(name)
 * @private
 */
JSTreeTable.prototype.getColumnsWidthByName = function() {
  var columns = this.model.columns;
  var widths = {};
  for (var i = 0; i < columns.length; i++) {
    var column = columns[i];
    var width = column.defaultWidth ? column.defaultWidth : "6rem";
    widths[column.name] = width;
  }
  return widths;
}

/** 
 * Removes components added to this panel and their listeners.
 */
JSTreeTable.prototype.dispose = function() {
  this.unregisterEventListeners();
  this.container.removeChild(this.tableElement);
}