define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var POSITIONS = [
        { label: "Top left", value: "top-left" },
        { label: "Top right", value: "top-right" },
        { label: "Bottom left", value: "bottom-left" },
        { label: "Bottom right", value: "bottom-right" }
    ];
    var BASEMAP_OPTIONS = [
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
    ];
    var configSettingsData = {
        home: {
            prop: "homeEnabled",
            propLabel: "Enable home",
            position: "homePosition",
            positionLabel: "Home position"
        },
        layerList: {
            propLabel: "Enable layer list",
            prop: "layerListEnabled",
            positionLabel: "Layer list position",
            position: "layerListPosition"
        },
        zoom: {
            propLabel: "Enable zoom",
            prop: "zoomControlsEnabled",
            positionLabel: "Zoom position",
            position: "zoomControlsPosition"
        },
        basemapToggle: {
            propLabel: "Enable basemap toggle",
            prop: "basemapToggleEnabled",
            positionLabel: "Basemap Toggle position",
            position: "basemapTogglePosition"
        },
        search: {
            propLabel: "Enable search",
            prop: "searchEnabled",
            positionLabel: "Search position",
            position: "searchPosition"
        }
    };
    var testElements = [];
    function createTestElements(configurationSettings) {
        createConfigSettingAndPositionNodes(configurationSettings);
        createSelectNode("Basemap toggle options", "nextBasemap", BASEMAP_OPTIONS, configurationSettings);
        createCalciteSwitchNode("Search open at start", "searchOpenAtStart", configurationSettings);
        createInputNode("Search Configuration", "searchConfig", configurationSettings);
        addElementsToDOM();
    }
    exports.createTestElements = createTestElements;
    function createConfigSettingAndPositionNodes(configurationSettings) {
        var configSettingDataKeys = Object.keys(configSettingsData);
        configSettingDataKeys.forEach(function (configSettingDataKey) {
            var data = configSettingsData[configSettingDataKey];
            createCalciteSwitchNode(data.propLabel, data.prop, configurationSettings);
            createSelectNode(data.positionLabel, data.position, POSITIONS, configurationSettings);
        });
    }
    function createCalciteSwitchNode(label, propName, configurationSettings) {
        var calciteSwitchLabelNode = document.createElement("label");
        calciteSwitchLabelNode.classList.add("test-switch");
        var calciteSwitchNode = document.createElement("calcite-switch");
        calciteSwitchLabelNode.innerText = label;
        if (configurationSettings[propName]) {
            calciteSwitchNode.setAttribute("switched", "true");
        }
        calciteSwitchLabelNode.appendChild(calciteSwitchNode);
        calciteSwitchNode.addEventListener("calciteSwitchChange", function (event) {
            var node = event.target;
            var switched = !node.hasAttribute("switched");
            configurationSettings[propName] = switched;
        });
        testElements.push(calciteSwitchLabelNode);
    }
    function createSelectNode(label, propName, options, configurationSettings) {
        var selectLabel = document.createElement("label");
        selectLabel.innerText = label;
        var selectNode = document.createElement("select");
        options.forEach(function (position) {
            var option = document.createElement("option");
            option.label = position.label;
            option.value = position.value;
            if (position.value === configurationSettings[propName]) {
                option.selected = true;
            }
            selectNode.options.add(option);
        });
        selectNode.addEventListener("change", function (event) {
            var node = event.target;
            configurationSettings[propName] = node.value;
        });
        selectLabel.appendChild(selectNode);
        testElements.push(selectLabel);
    }
    function createInputNode(label, propName, configurationSettings) {
        var inputLabelNode = document.createElement("label");
        inputLabelNode.innerText = label;
        var inputNode = document.createElement("input");
        inputNode.addEventListener("change", function (event) {
            var node = event.target;
            configurationSettings[propName] = node.value;
        });
        inputLabelNode.appendChild(inputNode);
        testElements.push(inputLabelNode);
    }
    function addElementsToDOM() {
        var testElementsContainer = document.getElementById("testElements");
        testElements.forEach(function (testElement) {
            if (testElement.tagName === "BUTTON") {
                testElement.classList.add("btn");
            }
            testElement.classList.add("test-element");
            testElementsContainer.appendChild(testElement);
        });
    }
});
//# sourceMappingURL=createTestElements.js.map