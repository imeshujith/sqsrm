import React, { Component, Fragment } from "react";
import { Modal, Button } from "react-bootstrap";
import "./drawing-tool.css";

const colors = {
  1: "#0277bd",
  2: "#00796b",
  3: "#d32f2f",
  4: "#ffb74d",
  5: "#ab47bc",
};

const mergePoint = "#102027";

const blockStyles = {
  0: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "0px 0px 0px 0px",
      backgroundColor: "#607d8b",
    },
    name: "Straight",
  },
  1: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "0px 0px 00px 0px",
      backgroundColor: "#fff",
      border: "solid thin #b0bec5",
    },
    name: "Delete",
  },
  2: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "0px 50px 0px 0px",
      backgroundColor: "#607d8b",
    },
    name: "Top Left",
  },
  3: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "50px 0px 0px 0px",
      backgroundColor: "#607d8b",
    },
    name: "Top Right",
  },
  4: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "0px 0px 0px 50px",
      backgroundColor: "#607d8b",
    },
    name: "Bottom Left",
  },
  5: {
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "0px 0px 50px 0px",
      backgroundColor: "#607d8b",
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
      coordinate: [0, 0],
      point: null,
      drawMap: [],
      remainingBlocks: 0,
      blockType: null,
      lanes: [],
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
            onDoubleClick={() =>
              this.setState({ show: true, close: false, coordinate: [y, x] })
            }
            id={y + "" + x}
            key={y + "" + x}
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
              className="btn btn-success"
              onClick={this.selectBlock}
              id={blockStyles[count]["name"]}
            >
              {blockStyles[count]["name"]}
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

  definePoints(e) {}

  setLane = (e) => {
    let lane = {},
      lanes = [];
    lanes.number = e.target.value;
    lanes.blokcs = 0;
    lanes.push({ path: lane });
    this.setState({ lanes: { path: lane } });
    console.log(this.state.lanes);
  };

  drawPath = (e) => {
    let row = parseInt(e.target.id.charAt(0));
    let column = parseInt(e.target.id.charAt(1));

    let newMap = this.state.drawMap;

    if (
      this.state.blockType === "Straight" &&
      this.state.remainingBlocks >= 1
    ) {
      e.target.style.backgroundColor = "#607d8b";
      e.target.style.border = "none";
      e.target.style.borderRadius = squareStyles["straight"];
      document.getElementById(e.target.id).innerHTML = "1";
      newMap[row][column] = 1;
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (this.state.blockType === "Delete") {
      e.target.style.backgroundColor = "#fff";
      e.target.style.border = "1px doted #585858";
      e.target.style.borderRadius = squareStyles["delete"];
      document.getElementById(e.target.id).innerHTML = "";
      newMap[row][column] = 0;
      this.setState({ remainingBlocks: (this.state.remainingBlocks += 1) });
    } else if (
      this.state.blockType === "Top Left" &&
      this.state.remainingBlocks >= 1
    ) {
      e.target.style.backgroundColor = "#607d8b";
      e.target.style.border = "none";
      e.target.style.borderRadius = squareStyles["topLeft"];
      newMap[row][column] = 2;
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Top Right" &&
      this.state.remainingBlocks >= 1
    ) {
      e.target.style.backgroundColor = "#607d8b";
      e.target.style.border = "none";
      e.target.style.borderRadius = squareStyles["topRight"];
      newMap[row][column] = 3;
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Bottom Left" &&
      this.state.remainingBlocks >= 1
    ) {
      e.target.style.backgroundColor = "#607d8b";
      e.target.style.border = "none";
      e.target.style.borderRadius = squareStyles["bottomLeft"];
      newMap[row][column] = 4;
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    } else if (
      this.state.blockType === "Bottom Right" &&
      this.state.remainingBlocks >= 1
    ) {
      e.target.style.backgroundColor = "#607d8b";
      e.target.style.border = "none";
      e.target.style.borderRadius = squareStyles["bottomRight"];
      newMap[row][column] = 5;
      this.setState({ remainingBlocks: (this.state.remainingBlocks -= 1) });
    }

    this.setState({ drawMap: newMap });
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
                            <option value={""} selected={""} default={""}>
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
                              this.setState({ remainingBlocks: e.target.value })
                            }
                          >
                            <option value={""} selected={""} default={""}>
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
                          <select className="form-control" name="point-name">
                            <option value={""} selected={""} default={""}>
                              Select lane type
                            </option>
                            <option value={1}>Separate Entry/Exit</option>
                            <option value={2}>
                              Separate Entry, Common Exit
                            </option>
                            <option value={3}>
                              Common Entry, Separate Exit
                            </option>
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
                          <button className="btn btn-primary btn-block save-path">
                            Save path
                          </button>
                        </div>
                      </div>

                      <div className="row mt-4">
                        <label
                          htmlFor="staticEmail"
                          className="col-sm-4 font-weight-bold"
                        >
                          Remaining Blocks
                        </label>
                        <div className="col-sm-8 font-weight-bold">
                          {this.state.remainingBlocks}
                        </div>
                      </div>

                      <div className="row mt-4">
                        <label
                          htmlFor="staticEmail"
                          className="col-sm-4 font-weight-bold"
                        >
                          Merge Points
                        </label>
                        <div className="col-sm-8 font-weight-bold">
                          {this.state.remainingBlocks}
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
                    name="point-name"
                    onChange={(e) => this.setState({ point: e.target.value })}
                  >
                    <option Value="" selected default>
                      Select point
                    </option>
                    <option value="0">Arrival</option>
                    <option value="1">Menu</option>
                    <option value="2">Cashier</option>
                    <option value="3">Pickup</option>
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
              <Button variant="primary" onClick={this.definePoints}>
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
