// Copyright 2020 Esri
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.​

(() => {
  const { pathname, search } = window.location;
  const appPath = pathname.substring(0, pathname.lastIndexOf("/"));
  const instantPath = appPath.slice(0, appPath.lastIndexOf("/"));

  const localeUrlParamRegex = /locale=([\w-]+)/;
  const dojoLocale = search.match(localeUrlParamRegex) ? RegExp.$1 : undefined;

  const config = {
    async: true,
    has: {
      "esri-native-promise": true
    },
    locale: dojoLocale,
    packages: [
      {
        name: "Application",
        location: `${appPath}`
      },
      {
        name: "ApplicationBase",
        location: `${instantPath}/node_modules/@esri/application-base-js`,
        main: "ApplicationBase"
      },
      {
        name: "TemplatesCommonLib",
        location: `${instantPath}/node_modules/templates-common-library/dist`
      },
      {
        name: "dojoTelemetry",
        location: `${appPath}/telemetry`,
        main: "telemetryDojoMin"
      },
      {
        name: "Screenshot",
        location: `${appPath}/Components/Screenshot/Screenshot`
      },
      {
        name: "Info",
        location: `${appPath}/Components/Info/Info`
      },
      {
        name: "Splash",
        location: `${appPath}/Components/Splash/Splash`
      },
      {
        name: "Header",
        location: `${appPath}/Components/Header/Header`
      },
      {
        name: "Share",
        location: `${instantPath}/node_modules/@esri/configurable-app-components/Share`,
        main: "Share"
      },
      {
        name: "config",
        location: `${appPath}/config`
      }
    ]
  };
  window["esriConfig"] = { locale: dojoLocale };
  window["dojoConfig"] = config;
})();
