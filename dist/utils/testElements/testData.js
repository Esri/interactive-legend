define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        positions: [
            { label: "Top left", value: "top-left" },
            { label: "Top right", value: "top-right" },
            { label: "Bottom left", value: "bottom-left" },
            { label: "Bottom right", value: "bottom-right" }
        ],
        basemapOptions: [
            { value: "topo", label: "Topo" },
            {
                value: "streets",
                label: "Streets"
            },
            {
                value: "satellite",
                label: "Satellite"
            },
            { value: "hybrid", label: "Hybrid" },
            {
                value: "dark-gray",
                label: "Dark gray"
            },
            { value: "gray", label: "Gray" },
            {
                value: "national-geographic",
                label: "National Geographic"
            },
            { value: "oceans", label: "Oceans" },
            { value: "osm", label: "OSM" },
            {
                value: "terrain",
                label: "Terrain"
            },
            {
                value: "dark-gray-vector",
                label: "Dark gray vector"
            },
            {
                value: "gray-vector",
                label: "Gray vector"
            },
            {
                value: "streets-vector",
                label: "Streets vector"
            },
            {
                value: "streets-night-vector",
                label: "Streets night vector"
            },
            {
                value: "streets-navigation-vector",
                label: "Streets navigation vector"
            },
            {
                value: "topo-vector",
                label: "Topo vector"
            },
            {
                value: "streets-relief-vector",
                label: "Streets relief vector"
            }
        ],
        configSettingsData: {
            home: {
                prop: "home",
                propLabel: "Enable home",
                position: "homePosition",
                positionLabel: "Home position"
            },
            layerList: {
                propLabel: "Enable layer list",
                prop: "layerList",
                positionLabel: "Layer list position",
                position: "layerListPosition"
            },
            zoom: {
                propLabel: "Enable zoom",
                prop: "zoom",
                positionLabel: "Zoom position",
                position: "zoomPosition"
            },
            basemapToggle: {
                propLabel: "Enable basemap toggle",
                prop: "basemapToggle",
                positionLabel: "Basemap Toggle position",
                position: "basemapTogglePosition"
            },
            search: {
                propLabel: "Enable search",
                prop: "search",
                positionLabel: "Search position",
                position: "searchPosition"
            },
            infoPanel: {
                propLabel: "Info panel",
                prop: "infoPanel",
                positionLabel: "Info panel position",
                position: "infoPanelPosition"
            },
            splash: {
                propLabel: "Enable splash",
                prop: "splash",
                positionLabel: "Splash position",
                position: "splashButtonPosition"
            },
            screenshot: {
                propLabel: "Enable screenshot",
                prop: "screenshot",
                positionLabel: "Screenshot position",
                position: "screenshotPosition"
            }
        },
        filterModes: [
            {
                label: "Feature filter",
                value: "featureFilter"
            },
            {
                label: "Mute",
                value: "mute"
            }
        ]
    };
});
//# sourceMappingURL=testData.js.map