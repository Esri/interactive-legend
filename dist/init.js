/*
  Copyright 2020 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/
define(["require", "exports", "tslib", "dojo/i18n!./nls/resources", "dojo/text!../config/applicationBase.json", "dojo/text!../config/application.json", "ApplicationBase/ApplicationBase", "dojo/i18n!./userTypesError/nls/resources", "./Components/Unsupported/UnsupportedBrowser", "./Main"], function (require, exports, tslib_1, resources_1, applicationBaseConfig, applicationConfig, ApplicationBase, i18n, UnsupportedBrowser, Application) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    resources_1 = tslib_1.__importDefault(resources_1);
    var Main = new Application();
    new ApplicationBase({
        config: applicationConfig,
        settings: applicationBaseConfig
    })
        .load()
        .then(function (base) {
        if (base["isIE"]) {
            document.body.classList.remove("configurable-application--loading");
            document.body.innerHTML = "";
            new UnsupportedBrowser({
                container: document.body,
                isIE11: true
            });
            return;
        }
        return Main.init(base);
    }, function (message) {
        if (message === "identity-manager:not-authorized") {
            document.body.classList.remove("configurable-application--loading");
            document.body.classList.add("app-error");
            document.getElementById("main-container").innerHTML = "<h1>" + i18n.licenseError.title + "</h1><p>" + i18n.licenseError.message + "</p>";
        }
        else {
            var errorMessage = message &&
                typeof message === "object" &&
                message.hasOwnProperty("message") &&
                typeof message.message === "string" &&
                message.message
                ? message.message
                : resources_1.default.error;
            document.body.classList.remove("configurable-application--loading");
            document.body.classList.add("app-error");
            document.getElementById("main-container").innerHTML = "<h1>" + errorMessage + "</h1>";
        }
    });
});
//# sourceMappingURL=init.js.map