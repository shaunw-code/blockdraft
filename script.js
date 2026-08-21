// ====================
// NEW PROJECT
// ====================

const newProjectButton =
    document.getElementById("new-project-button");

const startScreen =
    document.getElementById("start-screen");

const editor =
    document.getElementById("editor");

newProjectButton.addEventListener("click", function() {
    startScreen.style.display = "none";
    editor.style.display = "block";
});


// ====================
// ELEMENTS
// ====================

const buildingButton =
    document.getElementById("building-button");

const selectButton =
    document.getElementById("select-button");

const grid =
    document.getElementById("grid");

const buildingLayer =
    document.getElementById("building-layer");


// Properties

const propertyMessage =
    document.getElementById("property-message");

const buildingProperties =
    document.getElementById("building-properties");

const roomProperties =
    document.getElementById("room-properties");

const buildingSize =
    document.getElementById("building-size");

const drawRoomButton =
    document.getElementById("draw-room-button");

const deleteBuildingButton =
    document.getElementById("delete-building-button");

const roomNameInput =
    document.getElementById("room-name");

const renameRoomButton =
    document.getElementById("rename-room-button");

const deleteRoomButton =
    document.getElementById("delete-room-button");


// ====================
// VARIABLES
// ====================

let currentTool = "select";

let buildingPoints = [];

let roomPoints = [];

let drawingBuilding = false;

let drawingRoom = false;

let selectedBuilding = null;

let selectedRoom = null;


// ====================
// GET GRID POSITION
// ====================

function getGridPosition(event) {

    const rect =
        grid.getBoundingClientRect();

    let x =
        event.clientX - rect.left;

    let y =
        event.clientY - rect.top;


    // Snap to grid

    const gridSize = 25;

    x =
        Math.round(x / gridSize) * gridSize;

    y =
        Math.round(y / gridSize) * gridSize;


    return {
        x: x,
        y: y
    };

}


// ====================
// SELECT TOOL
// ====================

selectButton.addEventListener("click", function() {

    currentTool = "select";

    drawingBuilding = false;
    drawingRoom = false;

    selectButton.classList.add("active");

    buildingButton.classList.remove("active");

    drawRoomButton.classList.remove("active");

    clearTemporaryDrawing();

    grid.style.cursor = "default";


    // Allow building clicks again

    document.querySelectorAll(".building-shape").forEach(function(building) {
        building.style.pointerEvents = "auto";
    });

});


// ====================
// BUILDING TOOL
// ====================

buildingButton.addEventListener("click", function() {

    currentTool = "building";

    drawingBuilding = true;

    drawingRoom = false;

    buildingPoints = [];

    clearTemporaryDrawing();

    buildingButton.classList.add("active");

    selectButton.classList.remove("active");

    drawRoomButton.classList.remove("active");

    grid.style.cursor = "crosshair";

});


// ====================
// DRAW ROOM BUTTON
// ====================

drawRoomButton.addEventListener("click", function() {

    if (selectedBuilding === null) {
        return;
    }

    currentTool = "room";

    drawingRoom = true;

    drawingBuilding = false;

    roomPoints = [];

    clearTemporaryDrawing();

    drawRoomButton.classList.add("active");

    selectButton.classList.remove("active");

    buildingButton.classList.remove("active");

    grid.style.cursor = "crosshair";


    // Allow clicks to pass through buildings
    document.querySelectorAll(".building-shape").forEach(function(building) {
        building.style.pointerEvents = "none";
    });

});


// ====================
// GRID CLICK
// ====================

grid.addEventListener("click", function(event) {

    // BUILDING

    if (
        currentTool === "building" &&
        drawingBuilding
    ) {

        const point =
            getGridPosition(event);

        handleBuildingPoint(point);

        return;
    }


    // ROOM

    if (
        currentTool === "room" &&
        drawingRoom
    ) {

        const point =
            getGridPosition(event);

        handleRoomPoint(point);

        return;
    }


    // SELECT

    if (currentTool === "select") {

        if (
            event.target === grid ||
            event.target === buildingLayer
        ) {

            deselectAll();

        }

    }

});


// ====================
// BUILDING POINT
// ====================

function handleBuildingPoint(point) {

    const x = point.x;
    const y = point.y;


    // Check for closing the building

    if (buildingPoints.length >= 3) {

        const first =
            buildingPoints[0];

        const distance =
            Math.sqrt(
                Math.pow(x - first.x, 2) +
                Math.pow(y - first.y, 2)
            );


        if (distance <= 10) {

            finishBuilding();

            return;

        }

    }


    buildingPoints.push(point);

    drawTemporaryPoints(
        buildingPoints
    );

}


// ====================
// FINISH BUILDING
// ====================

function finishBuilding() {

    if (buildingPoints.length < 3) {
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
            .map(function(point) {
                return point.x + "," + point.y;
            })
            .join(" ")
    );


    buildingLayer.appendChild(
        polygon
    );


    polygon.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            if (currentTool === "select") {

                selectBuilding(polygon);

            }

        }
    );


    buildingPoints = [];

    drawingBuilding = false;

    clearTemporaryDrawing();


    currentTool = "select";

    buildingButton.classList.remove("active");

    selectButton.classList.add("active");

    grid.style.cursor = "default";

}


// ====================
// SELECT BUILDING
// ====================

function selectBuilding(building) {

    deselectAll();


    selectedBuilding = building;

    selectedBuilding.classList.add(
        "selected"
    );


    propertyMessage.style.display =
        "none";

    roomProperties.style.display =
        "none";

    buildingProperties.style.display =
        "block";


    // Calculate dimensions

    const points =
        building
            .getAttribute("points")
            .split(" ")
            .map(function(point) {

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


    points.forEach(function(point) {

        minX =
            Math.min(minX, point.x);

        maxX =
            Math.max(maxX, point.x);

        minY =
            Math.min(minY, point.y);

        maxY =
            Math.max(maxY, point.y);

    });


    buildingSize.textContent =
        "Size: " +
        (maxX - minX) +
        " × " +
        (maxY - minY) +
        " grid units";

}


// ====================
// ROOM POINT
// ====================

function handleRoomPoint(point) {

    const x = point.x;
    const y = point.y;


    // Check whether we're closing the room

    if (roomPoints.length >= 3) {

        const first =
            roomPoints[0];

        const distance =
            Math.sqrt(
                Math.pow(x - first.x, 2) +
                Math.pow(y - first.y, 2)
            );


        if (distance <= 10) {

            finishRoom();

            return;

        }

    }


    roomPoints.push(point);

    drawTemporaryPoints(
        roomPoints
    );

}


// ====================
// FINISH ROOM
// ====================

function finishRoom() {

    if (roomPoints.length < 3) {
        return;
    }


    // ====================
    // ROOM GROUP
    // ====================

    const roomGroup =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g"
        );


    roomGroup.classList.add(
        "room-group"
    );


    // ====================
    // ROOM SHAPE
    // ====================

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
            .map(function(point) {
                return point.x + "," + point.y;
            })
            .join(" ")
    );


    roomGroup.appendChild(
        polygon
    );


    // ====================
    // ROOM NAME
    // ====================

    const center =
        getPolygonCenter(
            roomPoints
        );


    const text =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );


    text.classList.add(
        "room-label"
    );


    text.setAttribute(
        "x",
        center.x
    );

    text.setAttribute(
        "y",
        center.y
    );


    text.textContent =
        "Untitled Room";


    roomGroup.appendChild(
        text
    );


    roomGroup.dataset.name =
        "Untitled Room";


    // Remember which building owns it

    roomGroup.dataset.building =
        selectedBuilding;


    buildingLayer.appendChild(
        roomGroup
    );


    // ====================
    // ROOM CLICK
    // ====================

    polygon.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            if (currentTool === "select") {

                selectRoom(
                    roomGroup,
                    polygon
                );

            }

        }
    );


    // ====================
    // RESET DRAWING
    // ====================

    roomPoints = [];

    drawingRoom = false;

    clearTemporaryDrawing();


currentTool = "select";

drawRoomButton.classList.remove(
    "active"
);

selectButton.classList.add(
    "active"
);

grid.style.cursor = "default";


// Allow building clicks again

document.querySelectorAll(".building-shape").forEach(function(building) {
    building.style.pointerEvents = "auto";
});

}


// ====================
// POLYGON CENTER
// ====================

function getPolygonCenter(points) {

    let totalX = 0;

    let totalY = 0;


    points.forEach(function(point) {

        totalX += point.x;

        totalY += point.y;

    });


    return {
        x: totalX / points.length,
        y: totalY / points.length
    };

}


// ====================
// SELECT ROOM
// ====================

function selectRoom(
    roomGroup,
    polygon
) {

    deselectAll();


    selectedRoom =
        roomGroup;

    selectedBuilding =
        null;


    polygon.classList.add(
        "selected"
    );


    propertyMessage.style.display =
        "none";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "block";


    roomNameInput.value =
        roomGroup.dataset.name;

}


// ====================
// RENAME ROOM
// ====================

renameRoomButton.addEventListener(
    "click",
    function() {

        if (selectedRoom === null) {
            return;
        }


        const newName =
            roomNameInput.value.trim();


        if (newName === "") {
            return;
        }


        selectedRoom.dataset.name =
            newName;


        const label =
            selectedRoom.querySelector(
                ".room-label"
            );


        label.textContent =
            newName;

    }
);


// ====================
// DELETE ROOM
// ====================

deleteRoomButton.addEventListener(
    "click",
    function() {

        if (selectedRoom === null) {
            return;
        }


        selectedRoom.remove();

        selectedRoom = null;


        propertyMessage.style.display =
            "block";

        roomProperties.style.display =
            "none";

    }
);


// ====================
// DELETE BUILDING
// ====================

deleteBuildingButton.addEventListener(
    "click",
    function() {

        if (selectedBuilding === null) {
            return;
        }


        selectedBuilding.remove();

        selectedBuilding = null;


        propertyMessage.style.display =
            "block";

        buildingProperties.style.display =
            "none";

    }
);


// ====================
// DESELECT
// ====================

function deselectAll() {

    if (selectedBuilding !== null) {

        selectedBuilding.classList.remove(
            "selected"
        );

    }


    if (selectedRoom !== null) {

        const polygon =
            selectedRoom.querySelector(
                ".room-shape"
            );

        if (polygon) {

            polygon.classList.remove(
                "selected"
            );

        }

    }


    selectedBuilding = null;

    selectedRoom = null;


    propertyMessage.style.display =
        "block";

    buildingProperties.style.display =
        "none";

    roomProperties.style.display =
        "none";

}


// ====================
// TEMPORARY DRAWING
// ====================

function drawTemporaryPoints(points) {

    clearTemporaryDrawing();


    points.forEach(function(point) {

        const pointElement =
            document.createElement("div");

        pointElement.classList.add(
            "grid-point"
        );

        pointElement.style.left =
            point.x + "px";

        pointElement.style.top =
            point.y + "px";

        grid.appendChild(
            pointElement
        );

    });


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


// ====================
// TEMPORARY LINE
// ====================

function createTemporaryLine(
    point1,
    point2
) {

    const line =
        document.createElement("div");

    line.classList.add(
        "building-line"
    );


    const dx =
        point2.x - point1.x;

    const dy =
        point2.y - point1.y;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const angle =
        Math.atan2(dy, dx) *
        180 / Math.PI;


    line.style.width =
        length + "px";

    line.style.left =
        point1.x + "px";

    line.style.top =
        point1.y + "px";

    line.style.transform =
        "rotate(" + angle + "deg)";


    grid.appendChild(
        line
    );

}


// ====================
// CLEAR TEMPORARY
// ====================

function clearTemporaryDrawing() {

    document
        .querySelectorAll(".building-line")
        .forEach(function(line) {

            line.remove();

        });


    document
        .querySelectorAll(".grid-point")
        .forEach(function(point) {

            point.remove();

        });

}