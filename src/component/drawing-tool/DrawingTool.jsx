import React, { Component, Fragment } from "react";
import { Modal, Button } from "react-bootstrap";
import "./drawing-tool.css";
import axios from "axios";

const colors = {
  1: "#2979ff",
  2: "#4caf50",
  3: "#e91e63",
  4: "#ffb74d",
  5: "#673ab7",
};

const mergePoint = "#263238";

const blockStyles = {
  0: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "0px 0px 0px 0px",
      backgroundColor: "#009688",
    },
    name: "Straight",
  },
  1: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "0px 0px 0px 0px",
      backgroundColor: "#fff",
      border: "solid thin #b0bec5",
    },
    name: "Delete",
  },
  2: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "0px 40px 0px 0px",
      backgroundColor: "#009688",
    },
    name: "Top Left",
  },
  3: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "40px 0px 0px 0px",
      backgroundColor: "#009688",
    },
    name: "Top Right",
  },
  4: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "0px 0px 0px 40px",
      backgroundColor: "#009688",
    },
    name: "Bottom Left",
  },
  5: {
    style: {
      width: "40px",
      height: "40px",
      borderRadius: "0px 0px 40px 0px",
      backgroundColor: "#009688",
    },
    name: "Bottom Right",
  },
};

const squareStyles = {
  straight: "none",
  delete: "none",
  topLeft: "0px 50px 0px 0px",
  topRight: "50px 0px 0px 0px",
  bottomLeft: "0px 0px 0px 50px",
  bottomRight: "0px 0px 50px 0px",
};

class DrawingTool extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
      pointCoordinate: null,
      pointId: null,
      pointLoopId: null,
      drawMap: [],
      remainingBlocks: 0,
      mergePoints: 0,
      blockType: null,
      laneData: [],
      laneNumber: null,
      previousCoordinates: null,
      pathData: [],
      firstClick: false,
    };
  }

  componentDidMount() {
    this.generateTileMap();
    this.generatesBlocks();
    this.carsPerLane();
    this.generateEmptyMap();
  }

  generateTileMap() {
    let rows = [];
    for (let y = 0; y < 20; y++) {
      const column = [];
      for (let x = 0; x < 20; x++) {
        column.push(
          <td
            key={x}
            className={"text-center"}
            onClick={this.drawPath}
            onDoubleClick={(e) =>
              this.setState({
                show: true,
                close: false,
                pointCoordinate: y + "," + x,
              })
            }
            id={y + "," + x}
            key={y + "," + x}
          ></td>
        );
      }
      rows.push(<tr key={y}>{column}</tr>);
    }
    return rows;
  }

  carsPerLane() {
    let options = [];
    for (let cars = 1; cars <= 20; cars++) {
      options.push(
        <option value={cars} key={cars}>
          {cars}
        </option>
      );
    }
    return options;
  }

  generatesBlocks = () => {
    let rows = [];
    let count = 0;
    for (let row = 0; row < 3; row++) {
      let columns = [];
      for (let column = 0; column < 2; column++) {
        columns.push(
          <td className="text-center" key={count}>
            <button
              type="button"
              className="btn btn-link"
              onClick={this.selectBlock}
              id={blockStyles[count]["name"]}
            >
              <div
                style={blockStyles[count]["style"]}
                onClick={this.selectBlock}
                id={blockStyles[count]["name"]}
              ></div>
            </button>
          </td>
        );
        count++;
      }
      rows.push(<tr key={row}>{columns}</tr>);
    }
    return rows;
  };

  generateEmptyMap() {
    let rows = [];
    for (let y = 0; y < 20; y++) {
      let columns = [];
      for (let x = 0; x < 20; x++) {
        columns.push(0);
      }
      rows.push(columns);
    }
    this.setState({ drawMap: rows });
  }

  selectBlock = (e) => {
    this.setState({ blockType: e.target.id });
  };

  definePoint = (e) => {
    e.preventDefault();
    if (this.state.laneData) {
      this.state.laneData.forEach((object) => {
        if (object.coordinate === this.state.pointCoordinate) {
          object.pointCoordinate = this.state.pointCoordinate;
          object.pointId = this.state.pointId;
          object.pointLoopId = this.state.pointLoopId;
        }
      });
    }
    this.setState({ show: false });
  };

  setLane = (e) => {
    this.setState({ laneNumber: e.target.value });
  };

  drawPath = (e) => {
    let gridId = e.target.id;

    if (
      this.state.blockType === "Straight" &&
      this.state.remainingBlocks >= 1
    ) {
      this.setGridStyle(
        e,
        colors[this.state.laneNumber],
        "none",
        squareStyles["straight"],
        1
      );
      this.setLaneData(gridId, 1, false);
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (this.state.blockType === "Delete") {
      if (this.state.laneData) {
        let newLaneData = this.state.laneData.filter(function (object) {
          return object.coordinate !== gridId;
        });
        this.setState({ laneData: newLaneData });
      }

      this.setGridStyle(
        e,
        "#fff",
        "1px solid #cfd8dc",
        squareStyles["delete"],
        0
      );
      this.setState({ remainingBlocks: (this.state.remainingBlocks += 1) });
    } else if (
      this.state.blockType === "Top Left" &&
      this.state.remainingBlocks >= 1
    ) {
      this.setGridStyle(
        e,
        colors[this.state.laneNumber],
        "none",
        squareStyles["topLeft"],
        2
      );

      this.setLaneData(gridId, 2, false);
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Top Right" &&
      this.state.remainingBlocks >= 1
    ) {
      this.setGridStyle(
        e,
        colors[this.state.laneNumber],
        "none",
        squareStyles["topRight"],
        3
      );

      this.setLaneData(gridId, 3, false);
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Bottom Left" &&
      this.state.remainingBlocks >= 1
    ) {
      this.setGridStyle(
        e,
        colors[this.state.laneNumber],
        "none",
        squareStyles["bottomLeft"],
        4
      );

      this.setLaneData(gridId, 4, false);
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Bottom Right" &&
      this.state.remainingBlocks >= 1
    ) {
      this.setGridStyle(
        e,
        colors[this.state.laneNumber],
        "none",
        squareStyles["bottomRight"],
        5
      );
      this.setLaneData(gridId, 5, false);
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (this.state.mergePoints >= 1 && this.state.remainingBlocks == 0) {
      this.state.mergePoints -= 1;
      let data_square = parseInt(
        document.getElementById(e.target.id).getAttribute("data-square")
      );
      this.setGridStyle(
        e,
        mergePoint,
        "none",
        data_square == 1
          ? squareStyles["straight"]
          : data_square == 2
          ? squareStyles["topLeft"]
          : data_square == 3
          ? squareStyles["topRight"]
          : data_square == 4
          ? squareStyles["bottomLeft"]
          : squareStyles["bottomRight"],
        data_square
      );
      this.setLaneData(gridId, data_square, true);
    }
  };

  setGridStyle = (event, color, border, squareStyle, type) => {
    event.target.style.backgroundColor = color;
    event.target.style.border = border;
    event.target.style.borderRadius = squareStyle;
    document.getElementById(event.target.id).setAttribute("data-square", type);
    document.getElementById(event.target.id).setAttribute("data-clicked", "1");

    if (this.state.laneNumber === 1) {
      document
        .getElementById(event.target.id)
        .setAttribute("data-laneId", this.state.laneNumber);
    }
  };

  setLaneData = (gridId, shape, merge) => {
    let parentId = document.getElementById(gridId).getAttribute("data-laneId");

    this.state.laneData.push({
      coordinate: gridId,
      pointCoordinate: null,
      pointId: null,
      pointLoopId: null,
      shape: shape,
      mergePoint: merge,
      mergePointCoordinate: merge ? gridId : null,
      parent: parseInt(this.state.laneNumber) == 1 ? true : false,
      parentId: merge ? parentId : null,
      direction: this.detectDirection(gridId),
      start: false,
      end: false,
    });
  };

  detectDirection = (currentCoordinate) => {
    if (this.state.previousCoordinates === null && !this.state.firstClick) {
      this.setState({
        firstClick: true,
        previousCoordinates: currentCoordinate,
      });
      return null;
    } else {
      let prevCoordinate = this.state.previousCoordinates.split(",");
      let prevRow = parseInt(prevCoordinate.splice(0, 1).join(""));
      let prevCol = parseInt(prevCoordinate.join(","));

      let curCoordinate = currentCoordinate.split(",");
      let curRow = parseInt(curCoordinate.splice(0, 1).join(""));
      let curCol = parseInt(curCoordinate.join(","));
      let curType = document
        .getElementById(currentCoordinate)
        .getAttribute("data-square");

      this.setState({
        previousCoordinates: currentCoordinate,
      });

      if (curRow > prevRow && curCol === prevCol && curType === "1") {
        return 1;
      } else if (curRow < prevRow && curCol === prevCol && curType === "1") {
        return 2;
      } else if (curRow === prevRow && curCol > prevCol && curType === "1") {
        return 3;
      } else if (curRow === prevRow && curCol < prevCol && curType === "1") {
        return 4;
      } else if (curRow > prevRow && curCol === prevCol && curType === "5") {
        return 5;
      } else if (curRow > prevRow && curCol === prevCol && curType === "4") {
        return 6;
      } else if (curRow < prevRow && curCol === prevCol && curType === "2") {
        return 7;
      } else if (curRow < prevRow && curCol === prevCol && curType === "3") {
        return 8;
      } else if (curRow === prevRow && curCol > prevCol && curType === "5") {
        return 9;
      } else if (curRow === prevRow && curCol > prevCol && curType === "2") {
        return 10;
      } else if (curRow === prevRow && curCol < prevCol && curType === "4") {
        return 11;
      } else if (curRow === prevRow && curCol < prevCol && curType === "3") {
        return 12;
      }
    }
  };

  submitLaneData = () => {
    // set start point true for the array first element
    this.state.laneData[0]["start"] = true;

    // set end point true for the array last element
    this.state.laneData[this.state.laneData.length - 1]["mergePoint"]
      ? (this.state.laneData[this.state.laneData.length - 1]["end"] = true)
      : (this.state.laneData[this.state.laneData.length - 2]["end"] = true);

    let nextCoordinate = this.state.laneData[1]["coordinate"].split(",");
    let nextRow = parseInt(nextCoordinate.splice(0, 1).join(""));
    let nextCol = parseInt(nextCoordinate.join(","));

    let prevShape = this.state.laneData[0]["shape"];
    let prevCoordinate = this.state.laneData[0]["coordinate"].split(",");
    let prevRow = parseInt(prevCoordinate.splice(0, 1).join(""));
    let prevCol = parseInt(prevCoordinate.join(","));

    if (this.state.laneData) {
      if (this.state.laneData[0]) {
        if (nextRow > prevRow && nextCol === prevCol && prevShape === 1) {
          this.state.laneData[0]["direction"] = 1;
        } else if (
          nextRow < prevRow &&
          nextCol === prevCol &&
          prevShape === 1
        ) {
          this.state.laneData[0]["direction"] = 2;
        } else if (
          nextRow === prevRow &&
          nextCol > prevCol &&
          prevShape === 1
        ) {
          this.state.laneData[0]["direction"] = 3;
        } else if (
          nextRow === prevRow &&
          nextCol < prevCol &&
          prevShape === 1
        ) {
          this.state.laneData[0]["direction"] = 4;
        } else if (
          nextRow > prevRow &&
          nextCol === prevCol &&
          prevShape === 5
        ) {
          this.state.laneData[0]["direction"] = 5;
        } else if (
          nextRow > prevRow &&
          nextCol === prevCol &&
          prevShape === 2
        ) {
          this.state.laneData[0]["direction"] = 6;
        } else if (
          nextRow < prevRow &&
          nextCol === prevCol &&
          prevShape === 4
        ) {
          this.state.laneData[0]["direction"] = 7;
        } else if (
          nextRow < prevRow &&
          nextCol === prevCol &&
          prevShape === 5
        ) {
          this.state.laneData[0]["direction"] = 8;
        } else if (
          nextRow === prevRow &&
          nextCol > prevCol &&
          prevShape === 3
        ) {
          this.state.laneData[0]["direction"] = 9;
        } else if (
          nextRow === prevRow &&
          nextCol > prevCol &&
          prevShape === 4
        ) {
          this.state.laneData[0]["direction"] = 10;
        } else if (
          nextRow === prevRow &&
          nextCol < prevCol &&
          prevShape === 2
        ) {
          this.state.laneData[0]["direction"] = 11;
        } else if (
          nextRow === prevRow &&
          nextCol < prevCol &&
          prevShape === 5
        ) {
          this.state.laneData[0]["direction"] = 12;
        }
      }
    }

    if (this.state.laneNumber != 1) {
      var equalPoints = this.state.pathData[0]["path"].find(
        (path) =>
          path["coordinate"] ==
          this.state.laneData[this.state.laneData.length - 1]["coordinate"]
      );
    }

    console.log(equalPoints);
    if (equalPoints) {
      let isMapped = false;
      this.state.pathData[0]["path"].forEach((data) => {
        if (data["coordinate"] === equalPoints) {
        }
      });
    }

    let pathData = {
      id: this.state.laneNumber,
      path: this.state.laneData,
    };

    axios
      .post("http://localhost:8000/api/lanes/", {
        lane_number: parseInt(this.state.laneNumber),
        lane_data: JSON.stringify(pathData),
        created: Date.now(),
      })
      .then(
        (response) => {
          this.state.pathData.push(pathData);
          this.setState({
            coordinate: null,
            pointId: null,
            pointLoopId: null,
            remainingBlocks: 0,
            mergePoints: 0,
            blockType: null,
            laneData: [],
            laneNumber: null,
            previousCoordinates: null,
            firstClick: false,
          });
        },
        (error) => {
          console.log(error);
        }
      );
  };

  render() {
    return (
      <Fragment>
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">Drawing Tool</div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col-8">
                      <table className="drawing-table">
                        <tbody>{this.generateTileMap()}</tbody>
                      </table>
                    </div>
                    <div className="col-4">
                      <div className="form-group row">
                        <label
                          htmlFor="staticEmail"
                          className="col-sm-4 col-form-label"
                        >
                          Lane Number
                        </label>
                        <div className="col-sm-8">
                          <select
                            className="form-control"
                            name="point-name"
                            onChange={this.setLane}
                          >
                            <option value={""} selected default={""} disabled>
                              Select lane number
                            </option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label
                          htmlFor="staticEmail"
                          className="col-sm-4 col-form-label"
                        >
                          Cars per lane
                        </label>
                        <div className="col-sm-8">
                          <select
                            className="form-control"
                            name="point-name"
                            onChange={(e) =>
                              this.setState({
                                remainingBlocks: e.target.value,
                              })
                            }
                          >
                            <option value={""} selected default={""} disabled>
                              Select number of cars per lane
                            </option>
                            {this.carsPerLane()}
                          </select>
                        </div>
                      </div>

                      <div className="form-group row">
                        <label className="col-sm-4 col-form-label">
                          Lane Type
                        </label>
                        <div className="col-sm-8">
                          <select
                            className="form-control"
                            name="point-name"
                            onChange={(e) =>
                              e.target.value > 1
                                ? this.setState({ mergePoints: 1 })
                                : this.setState({ mergePoints: 0 })
                            }
                          >
                            <option value={""} selected default={""} disabled>
                              Select lane type
                            </option>
                            <option value={1}>Separate Entry/Exit</option>
                            <option value={2}>
                              Separate Entry, Common Exit
                            </option>
                            <option value={3}>
                              Common Entry, Separate Exit
                            </option>
                            <option value={4}>Common Entry, Common Exit</option>
                          </select>
                        </div>
                      </div>

                      <div className="row mt-4">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-8">
                          <table className="table table-bordered justify-content-center block-table">
                            <tbody>{this.generatesBlocks()}</tbody>
                          </table>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-8">
                          {this.state.laneNumber >= 1 ? (
                            <button
                              className="btn btn-primary btn-block btn-lg save-path"
                              type="button"
                              onClick={this.submitLaneData}
                            >
                              Save Lane {this.state.laneNumber} Configurations
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-block btn-lg save-path disabled"
                              type="button"
                              onClick={this.submitLaneData}
                            >
                              Save Lane {this.state.laneNumber} Configurations
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="row mt-4">
                        <div className="col-sm-4"></div>
                        <div className="col-sm-4">
                          <div
                            className="alert alert-success text-center"
                            role="alert"
                          >
                            <small className="font-weight-bold">
                              Remaining Blocks
                            </small>
                            <h1 className="mt-2">
                              {this.state.remainingBlocks}
                            </h1>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div
                            className="alert alert-info text-center"
                            role="alert"
                          >
                            <small className="font-weight-bold">
                              Merge Points
                            </small>
                            <h1 className="mt-2">{this.state.mergePoints}</h1>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*point select modal*/}
        <Modal show={this.state.show}>
          <Modal.Header>
            <Modal.Title>Select point</Modal.Title>
          </Modal.Header>
          <form>
            <Modal.Body>
              <div className="form-group row">
                <label
                  htmlFor="staticEmail"
                  className="col-sm-4 col-form-label"
                >
                  Point Name
                </label>
                <div className="col-sm-8">
                  <select
                    className="form-control"
                    name="pointId"
                    onChange={(e) => this.setState({ pointId: e.target.value })}
                  >
                    <option value="" selected default>
                      Select point name
                    </option>
                    <option value="1">Arrival</option>
                    <option value="2">Menu</option>
                    <option value="3">Cashier</option>
                    <option value="4">Pickup</option>
                  </select>
                </div>
              </div>

              <div className="form-group row">
                <label
                  htmlFor="staticEmail"
                  className="col-sm-4 col-form-label"
                >
                  Point Name
                </label>
                <div className="col-sm-8">
                  <select
                    className="form-control"
                    name="pointId"
                    onChange={(e) =>
                      this.setState({ pointLoopId: e.target.value })
                    }
                  >
                    <option value="" selected default>
                      Select Loop Id
                    </option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                  </select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => this.setState({ show: false })}
              >
                Close
              </Button>
              <Button variant="primary" onClick={this.definePoint}>
                Add
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      </Fragment>
    );
  }
}

export default DrawingTool;
