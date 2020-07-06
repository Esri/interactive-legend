define(["require", "exports", "./testData"], function (require, exports, testData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var testElements = [];
    function createTestElements(configurationSettings) {
        createConfigSettingAndPositionNodes(configurationSettings);
        createCalciteSwitchNode("Enable legend option", "enableLegendOption", configurationSettings);
        createCalciteSwitchNode("Enable popup option", "enablePopupOption", configurationSettings);
        createCalciteSwitchNode("Splash on start", "splashOnStart", configurationSettings);
        createInputNode("Splash title", "splashTitle", configurationSettings);
        createInputNode("Splash content", "splashContent", configurationSettings);
        createInputNode("Splash button text", "splashButtonText", configurationSettings);
        // MISC SETTINGS
        createSelectNode("Basemap toggle options", "nextBasemap", testData_1.default.basemapOptions, configurationSettings);
        createCalciteSwitchNode("Search open at start", "searchOpenAtStart", configurationSettings);
        createInputNode("Search Configuration", "searchConfig", configurationSettings);
        createInputNode("Title", "title", configurationSettings);
        createCalciteSwitchNode("Enable custom header", "customHeader", configurationSettings);
        createInputNode("Header HTML", "customHeaderHTML", configurationSettings);
        // Interactive Legend
        createSelectNode("Filter mode", "filterMode", testData_1.default.filterModes, configurationSettings);
        createInputNode("Mute opacity", "muteOpacity", configurationSettings);
        createInputNode("Mute grayscale", "muteGrayScale", configurationSettings);
        createSelectNode("Interactive Legend Position", "interactiveLegendPosition", testData_1.default.positions, configurationSettings);
        createCalciteSwitchNode("Update extent enabled", "updateExtent", configurationSettings);
        createCalciteSwitchNode("Enable feature count", "featureCount", configurationSettings);
        createInputNode("Custom CSS", "customCSS", configurationSettings);
        addElementsToDOM();
    }
    exports.createTestElements = createTestElements;
    function createConfigSettingAndPositionNodes(configurationSettings) {
        var configSettingsData = testData_1.default.configSettingsData, positions = testData_1.default.positions;
        var configSettingDataKeys = Object.keys(configSettingsData);
        configSettingDataKeys.forEach(function (configSettingDataKey) {
            var configSettingsData = testData_1.default.configSettingsData;
            var data = configSettingsData[configSettingDataKey];
            var position = data.position, positionLabel = data.positionLabel, prop = data.prop, propLabel = data.propLabel;
            createCalciteSwitchNode(propLabel, prop, configurationSettings);
            createSelectNode(positionLabel, position, positions, configurationSettings);
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