// ========================================
// BLOCKDRAFT
// ========================================


// ========================================
// START SCREEN
// ========================================

const startScreen =
    document.getElementById("start-screen");

const editor =
    document.getElementById("editor");

const newProjectButton =
    document.getElementById("new-project-button");

newProjectButton.addEventListener("click", () => {

    startScreen.style.display = "none";
    editor.style.display = "block";

});


// ========================================
// ELEMENTS
// ========================================

const grid =
    document.getElementById("grid");

const buildingLayer =
    document.getElementById("building-layer");

const selectButton =
    document.getElementById("select-button");

const buildingButton =
    document.getElementById("building-button");

const roadButton =
    document.getElementById("road-button");

const propertyMessage =
    document.getElementById("property-message");

const buildingProperties =
    document.getElementById("building-properties");

const roomProperties =
    document.getElementById("room-properties");

const roadProperties =
    document.getElementById("road-properties");

const sidewalkProperties =
    document.getElementById("sidewalk-properties");

const markingProperties =
    document.getElementById("marking-properties");


// Building

const buildingSize =
    document.getElementById("building-size");

const drawRoomButton =
    document.getElementById("draw-room-button");

const deleteBuildingButton =
    document.getElementById("delete-building-button");


// Room

const roomNameInput =
    document.getElementById("room-name");

const renameRoomButton =
    document.getElementById("rename-room-button");

const deleteRoomButton =
    document.getElementById("delete-room-button");


// Road

const roadNameInput =
    document.getElementById("road-name");

const renameRoadButton =
    document.getElementById("rename-road-button");

const roadWidthSelect =
    document.getElementById("road-width-select");

const roadLength =
    document.getElementById("road-length");

const drawSidewalkButton =
    document.getElementById("draw-sidewalk-button");

const drawMarkingButton =
    document.getElementById("draw-marking-button");

const deleteRoadButton =
    document.getElementById("delete-road-button");


// Sidewalk

const sidewalkColor =
    document.getElementById("sidewalk-color");

const deleteSidewalkButton =
    document.getElementById("delete-sidewalk-button");


// Markings

const markingColorType =
    document.getElementById("marking-color-type");

const markingStyle =
    document.getElementById("marking-style");

const selectedMarkingColor =
    document.getElementById("selected-marking-color");

const selectedMarkingStyle =
    document.getElementById("selected-marking-style");

const updateMarkingButton =
    document.getElementById("update-marking-button");

const deleteMarkingButton =
    document.getElementById("delete-marking-button");


// ========================================
// CONSTANTS
// ========================================

const GRID_SIZE = 25;

const SIDEWALK_WIDTH =
    GRID_SIZE * 2;


// ========================================
// STATE
// ========================================

let currentTool = "select";

let drawingBuilding = false;
let drawingRoom = false;
let drawingRoad = false;
let drawingSidewalk = false;
let drawingMarking = false;

let buildingPoints = [];
let roomPoints = [];
let roadPoints = [];
let sidewalkPoints = [];
let markingPoints = [];

let selectedBuilding = null;
let selectedRoom = null;
let selectedRoad = null;
let selectedSidewalk = null;
let selectedMarking = null;

let roadCrosshair = null;


// ========================================
// GRID POSITION
// ========================================

function getGridPosition(event) {

    const rect =
        grid.getBoundingClientRect();

    let x =
        event.clientX - rect.left;

    let y =
        event.clientY - rect.top;

    x =
        Math.round(x / GRID_SIZE) *
        GRID_SIZE;

    y =
        Math.round(y / GRID_SIZE) *
        GRID_SIZE;

    return { x, y };
}


// ========================================
// TOOL SELECTION
// ========================================

function setTool(tool) {

    currentTool = tool;

    drawingBuilding = false;
    drawingRoom = false;
    drawingRoad = false;
    drawingSidewalk = false;
    drawingMarking = false;

    buildingPoints = [];
    roomPoints = [];
    roadPoints = [];
    sidewalkPoints = [];
    markingPoints = [];

    clearTemporaryDrawing();
    removeRoadCrosshair();

    selectButton.classList.remove("active");
    buildingButton.classList.remove("active");
    roadButton.classList.remove("active");

    if (tool === "select") {

        selectButton.classList.add("active");

        grid.style.cursor =
            "default";

        restoreBuildingClicks();
    }

    if (tool === "building") {

        buildingButton.classList.add("active");

        drawingBuilding = true;

        grid.style.cursor =
            "crosshair";

        restoreBuildingClicks();
    }

    if (tool === "road") {

        roadButton.classList.add("active");

        drawingRoad = true;

        grid.style.cursor =
            "none";

        restoreBuildingClicks();

        createRoadCrosshair();
    }

    if (tool === "room") {

        drawingRoom = true;

        grid.style.cursor =
            "crosshair";

        disableBuildingClicks();
    }

    if (tool === "sidewalk") {

        drawingSidewalk = true;

        grid.style.cursor =
            "crosshair";

        disableBuildingClicks();
    }

    if (tool === "marking") {

        drawingMarking = true;

        grid.style.cursor =
            "crosshair";

        disableBuildingClicks();
    }
}


// ========================================
// TOOL BUTTONS
// ========================================

selectButton.addEventListener(
    "click",
    () => setTool("select")
);

buildingButton.addEventListener(
    "click",
    () => setTool("building")
);

roadButton.addEventListener(
    "click",
    () => setTool("road")
);


// ========================================
// ROAD CROSSHAIR
// ========================================

function createRoadCrosshair() {

    removeRoadCrosshair();

    roadCrosshair =
        document.createElement("div");

    roadCrosshair.classList.add(
        "road-crosshair"
    );

    roadCrosshair.innerHTML = `
        <div class="crosshair-horizontal"></div>
        <div class="crosshair-vertical"></div>
        <div class="crosshair-center"></div>
    `;

    grid.appendChild(
        roadCrosshair
    );
}


function removeRoadCrosshair() {

    if (roadCrosshair) {

        roadCrosshair.remove();

        roadCrosshair = null;
    }
}


function updateRoadCrosshair(point) {

    if (!roadCrosshair) {
        return;
    }

    roadCrosshair.style.left =
        `${point.x}px`;

    roadCrosshair.style.top =
        `${point.y}px`;
}


// ========================================
// MOUSE MOVEMENT
// ========================================

grid.addEventListener(
    "mousemove",
    (event) => {

        if (
            currentTool !== "road"
        ) {
            return;
        }

        const point =
            getGridPosition(event);

        updateRoadCrosshair(point);
    }
);


// ========================================
// GRID CLICK
// ========================================

grid.addEventListener(
    "click",
    (event) => {

        const point =
            getGridPosition(event);

        if (
            currentTool === "building"
        ) {
            addBuildingPoint(point);
            return;
        }

        if (
            currentTool === "room"
        ) {
            addRoomPoint(point);
            return;
        }

        if (
            currentTool === "road"
        ) {
            addRoadPoint(point);
            return;
        }

        if (
            currentTool === "sidewalk"
        ) {
            addSidewalkPoint(point);
            return;
        }

        if (
            currentTool === "marking"
        ) {
            addMarkingPoint(point);
            return;
        }
    }
);


// ========================================
// DOUBLE CLICK TO FINISH
// ========================================

grid.addEventListener(
    "dblclick",
    (event) => {

        event.preventDefault();

        if (
            currentTool === "road"
        ) {
            finishRoad();
        }

        if (
            currentTool === "sidewalk"
        ) {
            finishSidewalk();
        }

        if (
            currentTool === "marking"
        ) {
            finishMarking();
        }
    }
);


// ========================================
// BUILDING DRAWING
// ========================================

function addBuildingPoint(point) {

    if (buildingPoints.length > 0) {

        const last =
            buildingPoints[
                buildingPoints.length - 1
            ];

        if (
            last.x === point.x &&
            last.y === point.y
        ) {
            return;
        }
    }

    if (buildingPoints.length >= 3) {

        const first =
            buildingPoints[0];

        if (
            first.x === point.x &&
            first.y === point.y
        ) {

            finishBuilding();

            return;
        }
    }

    buildingPoints.push(point);

    drawTemporaryShape(
        buildingPoints
    );
}


// ========================================
// FINISH BUILDING
// ========================================

function finishBuilding() {

    if (
        buildingPoints.length < 3
    ) {
        return;
    }

    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );

    polygon.classList.add(
        "building-shape"
    );

    polygon.setAttribute(
        "points",
        buildingPoints
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ")
    );

    buildingLayer.appendChild(
        polygon
    );

    polygon.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                currentTool === "select"
            ) {
                selectBuilding(polygon);
            }
        }
    );

    buildingPoints = [];

    clearTemporaryDrawing();

    setTool("select");
}


// ========================================
// ROOM DRAWING
// ========================================

drawRoomButton.addEventListener(
    "click",
    () => {

        if (!selectedBuilding) {
            return;
        }

        setTool("room");
    }
);


function addRoomPoint(point) {

    if (roomPoints.length > 0) {

        const last =
            roomPoints[
                roomPoints.length - 1
            ];

        if (
            last.x === point.x &&
            last.y === point.y
        ) {
            return;
        }
    }

    if (roomPoints.length >= 3) {

        const first =
            roomPoints[0];

        if (
            first.x === point.x &&
            first.y === point.y
        ) {

            finishRoom();

            return;
        }
    }

    roomPoints.push(point);

    drawTemporaryShape(
        roomPoints
    );
}


// ========================================
// FINISH ROOM
// ========================================

function finishRoom() {

    if (
        roomPoints.length < 3
    ) {
        return;
    }

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );

    group.classList.add(
        "room-group"
    );

    const polygon =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
        );

    polygon.classList.add(
        "room-shape"
    );

    polygon.setAttribute(
        "points",
        roomPoints
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ")
    );

    group.appendChild(
        polygon
    );

    const center =
        getPolygonCenter(
            roomPoints
        );

    const label =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

    label.classList.add(
        "room-label"
    );

    label.setAttribute(
        "x",
        center.x
    );

    label.setAttribute(
        "y",
        center.y
    );

    label.textContent =
        "Untitled Room";

    group.appendChild(
        label
    );

    group.dataset.name =
        "Untitled Room";

    buildingLayer.appendChild(
        group
    );

    polygon.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                currentTool === "select"
            ) {

                selectRoom(
                    group,
                    polygon
                );
            }
        }
    );

    roomPoints = [];

    clearTemporaryDrawing();

    setTool("select");
}


// ========================================
// ROAD DRAWING
// ========================================

function addRoadPoint(point) {

    if (roadPoints.length > 0) {

        const last =
            roadPoints[
                roadPoints.length - 1
            ];

        if (
            last.x === point.x &&
            last.y === point.y
        ) {
            return;
        }
    }

    roadPoints.push(point);

    drawTemporaryShape(
        roadPoints
    );
}


// ========================================
// FINISH ROAD
// ========================================

function finishRoad() {

    if (
        roadPoints.length < 2
    ) {
        roadPoints = [];

        clearTemporaryDrawing();

        return;
    }

    const road =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );

    road.classList.add(
        "road-group"
    );

    road.dataset.name =
        "Unnamed Road";

    road.dataset.width =
        "6";

    road._points =
        roadPoints.map(
            point => ({
                x: point.x,
                y: point.y
            })
        );

    buildingLayer.appendChild(
        road
    );

    renderRoad(
        road
    );

    road.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                currentTool === "select"
            ) {
                selectRoad(road);
            }
        }
    );

    roadPoints = [];

    clearTemporaryDrawing();

    setTool("select");
}


// ========================================
// ROAD RENDERING
// ========================================

function renderRoad(road) {

    road.querySelectorAll(
        "*"
    ).forEach(
        element => element.remove()
    );

    const width =
        Number(
            road.dataset.width
        ) * GRID_SIZE;

    const path =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

    path.classList.add(
        "road-shape"
    );

    path.setAttribute(
        "d",
        buildSmoothPath(
            road._points
        )
    );

    path.style.strokeWidth =
        width;

    road.appendChild(
        path
    );
}


// ========================================
// SMOOTH PATH
// ========================================

function buildSmoothPath(points) {

    if (
        points.length < 2
    ) {
        return "";
    }

    let path =
        `M ${points[0].x} ${points[0].y}`;

    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const current =
            points[i];

        if (
            i === points.length - 1
        ) {

            path +=
                ` L ${current.x} ${current.y}`;

            continue;
        }

        const previous =
            points[i - 1];

        const next =
            points[i + 1];

        const radius =
            Math.min(
                35,
                distance(
                    previous,
                    current
                ) / 3,
                distance(
                    current,
                    next
                ) / 3
            );

        const start =
            moveToward(
                current,
                previous,
                radius
            );

        const end =
            moveToward(
                current,
                next,
                radius
            );

        path +=
            ` L ${start.x} ${start.y}`;

        path +=
            ` Q ${current.x} ${current.y} ${end.x} ${end.y}`;
    }

    return path;
}


// ========================================
// GEOMETRY HELPERS
// ========================================

function distance(a, b) {

    return Math.sqrt(
        Math.pow(
            b.x - a.x,
            2
        ) +
        Math.pow(
            b.y - a.y,
            2
        )
    );
}


function moveToward(
    from,
    to,
    amount
) {

    const length =
        distance(
            from,
            to
        );

    if (length === 0) {
        return {
            x: from.x,
            y: from.y
        };
    }

    return {
        x:
            from.x +
            ((to.x - from.x) /
                length) *
            amount,

        y:
            from.y +
            ((to.y - from.y) /
                length) *
            amount
    };
}


// ========================================
// ROAD SELECTION
// ========================================

function selectRoad(road) {

    deselectAll();

    selectedRoad =
        road;

    const path =
        road.querySelector(
            ".road-shape"
        );

    if (path) {

        path.classList.add(
            "selected"
        );
    }

    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "none";

    markingProperties.style.display =
        "none";

    roadProperties.style.display =
        "block";

    roadNameInput.value =
        road.dataset.name ||
        "Unnamed Road";

    roadWidthSelect.value =
        road.dataset.width ||
        "6";

    updateRoadProperties();
}


// ========================================
// ROAD WIDTH
// ========================================

roadWidthSelect.addEventListener(
    "change",
    () => {

        if (!selectedRoad) {
            return;
        }

        selectedRoad.dataset.width =
            roadWidthSelect.value;

        renderRoad(
            selectedRoad
        );

        selectedRoad
            .querySelector(
                ".road-shape"
            )
            .classList.add(
                "selected"
            );

        updateRoadProperties();
    }
);


// ========================================
// ROAD PROPERTIES
// ========================================

function updateRoadProperties() {

    if (!selectedRoad) {
        return;
    }

    roadLength.textContent =
        `Length: ${
            calculateRoadLength(
                selectedRoad
            )
        } grid units`;
}


function calculateRoadLength(road) {

    const points =
        road._points;

    let total = 0;

    for (
        let i = 0;
        i < points.length - 1;
        i++
    ) {

        total +=
            distance(
                points[i],
                points[i + 1]
            );
    }

    return Math.round(
        total / GRID_SIZE
    );
}


// ========================================
// RENAME ROAD
// ========================================

renameRoadButton.addEventListener(
    "click",
    () => {

        if (!selectedRoad) {
            return;
        }

        const name =
            roadNameInput.value.trim();

        if (!name) {
            return;
        }

        selectedRoad.dataset.name =
            name;
    }
);


// ========================================
// SIDEWALK DRAWING
// ========================================

drawSidewalkButton.addEventListener(
    "click",
    () => {

        if (!selectedRoad) {
            return;
        }

        setTool("sidewalk");
    }
);


function addSidewalkPoint(point) {

    if (sidewalkPoints.length > 0) {

        const last =
            sidewalkPoints[
                sidewalkPoints.length - 1
            ];

        if (
            last.x === point.x &&
            last.y === point.y
        ) {
            return;
        }
    }

    sidewalkPoints.push(point);

    drawTemporaryShape(
        sidewalkPoints
    );
}


// ========================================
// FINISH SIDEWALK
// ========================================

function finishSidewalk() {

    if (
        sidewalkPoints.length < 2
    ) {
        sidewalkPoints = [];

        clearTemporaryDrawing();

        return;
    }

    const sidewalk =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

    sidewalk.classList.add(
        "sidewalk-shape"
    );

    sidewalk.setAttribute(
        "d",
        buildSmoothPath(
            sidewalkPoints
        )
    );

    sidewalk.style.strokeWidth =
        SIDEWALK_WIDTH;

    sidewalk.style.stroke =
        "#c9ad78";

    sidewalk.dataset.color =
        "#c9ad78";

    buildingLayer.appendChild(
        sidewalk
    );

    sidewalk.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                currentTool === "select"
            ) {
                selectSidewalk(
                    sidewalk
                );
            }
        }
    );

    sidewalkPoints = [];

    clearTemporaryDrawing();

    setTool("select");
}


// ========================================
// SIDEWALK SELECTION
// ========================================

function selectSidewalk(
    sidewalk
) {

    deselectAll();

    selectedSidewalk =
        sidewalk;

    sidewalk.classList.add(
        "selected"
    );

    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "none";

    roadProperties.style.display =
        "none";

    markingProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "block";

    sidewalkColor.value =
        sidewalk.dataset.color ||
        "#c9ad78";
}


// ========================================
// SIDEWALK COLOR
// ========================================

sidewalkColor.addEventListener(
    "input",
    () => {

        if (!selectedSidewalk) {
            return;
        }

        selectedSidewalk.dataset.color =
            sidewalkColor.value;

        selectedSidewalk.style.stroke =
            sidewalkColor.value;
    }
);


// ========================================
// DELETE SIDEWALK
// ========================================

deleteSidewalkButton.addEventListener(
    "click",
    () => {

        if (!selectedSidewalk) {
            return;
        }

        selectedSidewalk.remove();

        selectedSidewalk =
            null;

        showNoSelection();
    }
);


// ========================================
// ROAD MARKING DRAWING
// ========================================

drawMarkingButton.addEventListener(
    "click",
    () => {

        if (!selectedRoad) {
            return;
        }

        setTool("marking");
    }
);


function addMarkingPoint(point) {

    if (markingPoints.length > 0) {

        const last =
            markingPoints[
                markingPoints.length - 1
            ];

        if (
            last.x === point.x &&
            last.y === point.y
        ) {
            return;
        }
    }

    markingPoints.push(point);

    drawTemporaryShape(
        markingPoints
    );
}


// ========================================
// FINISH MARKING
// ========================================

function finishMarking() {

    if (
        markingPoints.length < 2
    ) {
        markingPoints = [];

        clearTemporaryDrawing();

        return;
    }

    const group =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );

    group.classList.add(
        "marking-group"
    );

    group.dataset.color =
        markingColorType.value;

    group.dataset.style =
        markingStyle.value;

    group._points =
        markingPoints.map(
            point => ({
                x: point.x,
                y: point.y
            })
        );

    renderMarking(
        group
    );

    buildingLayer.appendChild(
        group
    );

    group.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                currentTool === "select"
            ) {
                selectMarking(
                    group
                );
            }
        }
    );

    markingPoints = [];

    clearTemporaryDrawing();

    setTool("select");
}


// ========================================
// RENDER MARKING
// ========================================

function renderMarking(
    group
) {

    group.querySelectorAll(
        "*"
    ).forEach(
        element => element.remove()
    );

    const color =
        group.dataset.color;

    const style =
        group.dataset.style;

    if (
        style === "double"
    ) {

        createMarkingPath(
            group,
            0,
            color
        );

        createMarkingPath(
            group,
            6,
            color
        );

        return;
    }

    if (
        style === "solid-dotted"
    ) {

        createMarkingPath(
            group,
            0,
            color,
            false
        );

        createMarkingPath(
            group,
            6,
            color,
            true
        );

        return;
    }

    if (
        style === "dotted-solid"
    ) {

        createMarkingPath(
            group,
            0,
            color,
            true
        );

        createMarkingPath(
            group,
            6,
            color,
            false
        );

        return;
    }

    createMarkingPath(
        group,
        0,
        color,
        style === "dotted"
    );
}


// ========================================
// CREATE MARKING PATH
// ========================================

function createMarkingPath(
    group,
    offset,
    color,
    dotted = false
) {

    const path =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

    path.classList.add(
        "marking-line"
    );

    path.setAttribute(
        "d",
        buildOffsetPath(
            group._points,
            offset
        )
    );

    path.style.stroke =
        color;

    path.style.strokeWidth =
        "4";

    if (dotted) {

        path.style.strokeDasharray =
            "12 10";
    }

    group.appendChild(
        path
    );
}


// ========================================
// OFFSET PATH
// ========================================

function buildOffsetPath(
    points,
    offset
) {

    if (
        offset === 0
    ) {
        return buildSmoothPath(
            points
        );
    }

    const adjusted = [];

    for (
        let i = 0;
        i < points.length;
        i++
    ) {

        let dx;
        let dy;

        if (i === 0) {

            dx =
                points[1].x -
                points[0].x;

            dy =
                points[1].y -
                points[0].y;

        } else {

            dx =
                points[i].x -
                points[i - 1].x;

            dy =
                points[i].y -
                points[i - 1].y;
        }

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const normalX =
            -dy / length;

        const normalY =
            dx / length;

        adjusted.push({
            x:
                points[i].x +
                normalX * offset,

            y:
                points[i].y +
                normalY * offset
        });
    }

    return buildSmoothPath(
        adjusted
    );
}


// ========================================
// MARKING SELECTION
// ========================================

function selectMarking(
    marking
) {

    deselectAll();

    selectedMarking =
        marking;

    marking.querySelectorAll(
        ".marking-line"
    ).forEach(
        line =>
            line.classList.add(
                "selected"
            )
    );

    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "none";

    roadProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "none";

    markingProperties.style.display =
        "block";

    selectedMarkingColor.value =
        marking.dataset.color;

    selectedMarkingStyle.value =
        marking.dataset.style;
}


// ========================================
// UPDATE MARKING
// ========================================

updateMarkingButton.addEventListener(
    "click",
    () => {

        if (!selectedMarking) {
            return;
        }

        selectedMarking.dataset.color =
            selectedMarkingColor.value;

        selectedMarking.dataset.style =
            selectedMarkingStyle.value;

        renderMarking(
            selectedMarking
        );

        selectedMarking.querySelectorAll(
            ".marking-line"
        ).forEach(
            line =>
                line.classList.add(
                    "selected"
                )
        );
    }
);


// ========================================
// DELETE MARKING
// ========================================

deleteMarkingButton.addEventListener(
    "click",
    () => {

        if (!selectedMarking) {
            return;
        }

        selectedMarking.remove();

        selectedMarking =
            null;

        showNoSelection();
    }
);


// ========================================
// BUILDING SELECTION
// ========================================

function selectBuilding(
    building
) {

    deselectAll();

    selectedBuilding =
        building;

    building.classList.add(
        "selected"
    );

    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "block";

    roomProperties.style.display =
        "none";

    roadProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "none";

    markingProperties.style.display =
        "none";

    const points =
        building
            .getAttribute("points")
            .split(" ")
            .map(point => {

                const values =
                    point.split(",");

                return {
                    x: Number(values[0]),
                    y: Number(values[1])
                };
            });

    let minX = Infinity;
    let maxX = -Infinity;

    let minY = Infinity;
    let maxY = -Infinity;

    points.forEach(
        point => {

            minX =
                Math.min(
                    minX,
                    point.x
                );

            maxX =
                Math.max(
                    maxX,
                    point.x
                );

            minY =
                Math.min(
                    minY,
                    point.y
                );

            maxY =
                Math.max(
                    maxY,
                    point.y
                );
        }
    );

    buildingSize.textContent =
        `Size: ${
            maxX - minX
        } × ${
            maxY - minY
        } grid units`;
}


// ========================================
// DELETE BUILDING
// ========================================

deleteBuildingButton.addEventListener(
    "click",
    () => {

        if (!selectedBuilding) {
            return;
        }

        selectedBuilding.remove();

        selectedBuilding =
            null;

        showNoSelection();
    }
);


// ========================================
// ROOM SELECTION
// ========================================

function selectRoom(
    group,
    polygon
) {

    deselectAll();

    selectedRoom =
        group;

    polygon.classList.add(
        "selected"
    );

    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "none";

    roadProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "none";

    markingProperties.style.display =
        "none";

    roomProperties.style.display =
        "block";

    roomNameInput.value =
        group.dataset.name ||
        "Untitled Room";
}


// ========================================
// RENAME ROOM
// ========================================

renameRoomButton.addEventListener(
    "click",
    () => {

        if (!selectedRoom) {
            return;
        }

        const name =
            roomNameInput.value.trim();

        if (!name) {
            return;
        }

        selectedRoom.dataset.name =
            name;

        const label =
            selectedRoom.querySelector(
                ".room-label"
            );

        if (label) {
            label.textContent =
                name;
        }
    }
);


// ========================================
// DELETE ROOM
// ========================================

deleteRoomButton.addEventListener(
    "click",
    () => {

        if (!selectedRoom) {
            return;
        }

        selectedRoom.remove();

        selectedRoom =
            null;

        showNoSelection();
    }
);


// ========================================
// DESELECT EVERYTHING
// ========================================

function deselectAll() {

    document
        .querySelectorAll(
            ".building-shape.selected"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "selected"
                )
        );

    document
        .querySelectorAll(
            ".room-shape.selected"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "selected"
                )
        );

    document
        .querySelectorAll(
            ".road-shape.selected"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "selected"
                )
        );

    document
        .querySelectorAll(
            ".sidewalk-shape.selected"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "selected"
                )
        );

    document
        .querySelectorAll(
            ".marking-line.selected"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "selected"
                )
        );

    selectedBuilding = null;
    selectedRoom = null;
    selectedRoad = null;
    selectedSidewalk = null;
    selectedMarking = null;

    showNoSelection();
}


// ========================================
// NO SELECTION
// ========================================

function showNoSelection() {

    propertyMessage.style.display =
        "block";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "none";

    roadProperties.style.display =
        "none";

    sidewalkProperties.style.display =
        "none";

    markingProperties.style.display =
        "none";
}


// ========================================
// TEMPORARY DRAWING
// ========================================

function drawTemporaryShape(
    points
) {

    clearTemporaryDrawing();

    points.forEach(
        point => {

            const dot =
                document.createElement(
                    "div"
                );

            dot.classList.add(
                "grid-point"
            );

            dot.style.left =
                `${point.x}px`;

            dot.style.top =
                `${point.y}px`;

            grid.appendChild(
                dot
            );
        }
    );

    for (
        let i = 0;
        i < points.length - 1;
        i++
    ) {

        createTemporaryLine(
            points[i],
            points[i + 1]
        );
    }
}


// ========================================
// TEMPORARY LINE
// ========================================

function createTemporaryLine(
    p1,
    p2
) {

    const line =
        document.createElement(
            "div"
        );

    line.classList.add(
        "building-line"
    );

    const dx =
        p2.x - p1.x;

    const dy =
        p2.y - p1.y;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    const angle =
        Math.atan2(
            dy,
            dx
        ) *
        180 /
        Math.PI;

    line.style.width =
        `${length}px`;

    line.style.left =
        `${p1.x}px`;

    line.style.top =
        `${p1.y}px`;

    line.style.transform =
        `rotate(${angle}deg)`;

    grid.appendChild(
        line
    );
}


// ========================================
// CLEAR TEMPORARY DRAWING
// ========================================

function clearTemporaryDrawing() {

    document
        .querySelectorAll(
            ".building-line, " +
            ".grid-point"
        )
        .forEach(
            element =>
                element.remove()
        );
}


// ========================================
// POLYGON CENTER
// ========================================

function getPolygonCenter(
    points
) {

    let x = 0;
    let y = 0;

    points.forEach(
        point => {

            x += point.x;
            y += point.y;
        }
    );

    return {
        x:
            x / points.length,

        y:
            y / points.length
    };
}


// ========================================
// BUILDING CLICK CONTROL
// ========================================

function disableBuildingClicks() {

    document
        .querySelectorAll(
            ".building-shape"
        )
        .forEach(
            building => {

                building.style.pointerEvents =
                    "none";
            }
        );
}


function restoreBuildingClicks() {

    document
        .querySelectorAll(
            ".building-shape"
        )
        .forEach(
            building => {

                building.style.pointerEvents =
                    "auto";
            }
        );
}


// ========================================
// INITIAL STATE
// ========================================

showNoSelection();

setTool("select");