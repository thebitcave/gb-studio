import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions";
import MapSelect from "../forms/MapSelect";
import DirectionPicker from "../../components/DirectionPicker";
import { FormField } from "../../components/library/Forms";

class WorldEditor extends Component {
  onEdit = key => e => {
    const value = e.currentTarget
      ? e.currentTarget.type === "number"
        ? parseInt(e.currentTarget.value, 10)
        : e.currentTarget.type === "checkbox"
        ? e.currentTarget.checked
        : e.currentTarget.value
      : e;
    this.props.editProject({
      [key]: value
    });
  };

  render() {
    const { project, settings } = this.props;

    if (!project) {
      return <div />;
    }

    return (
      <div className="WorldEditor">
        <h2>Settings</h2>

        <FormField>
          <label>
            <input
              type="checkbox"
              className="Checkbox"
              checked={settings.showCollisions}
              onChange={this.onEdit("showCollisions")}
            />
            Show Collisions
          </label>
        </FormField>

        <FormField>
          <label>
            <input
              type="checkbox"
              className="Checkbox"
              checked={settings.showConnections}
              onChange={this.onEdit("showConnections")}
            />
            Show Connections
          </label>
        </FormField>

        <h2>Start Map</h2>

        <FormField>
          <label>
            <div className="Select">
              <MapSelect
                value={project.startMapId || ""}
                onChange={this.onEdit("startMapId")}
              />
            </div>
          </label>
        </FormField>

        <FormField>
          <label className="HalfWidth">
            X
            <input
              type="number"
              value={project.startX || 0}
              min={1}
              onChange={this.onEdit("startX")}
            />
          </label>
        </FormField>

        <FormField>
          <label className="HalfWidth">
            Y
            <input
              type="number"
              value={project.startY || 0}
              min={1}
              onChange={this.onEdit("startY")}
            />
          </label>
        </FormField>

        <FormField>
          <label>Direction</label>
          <DirectionPicker
            value={project.startDirection || 0}
            onChange={this.onEdit("startDirection")}
          />
        </FormField>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    project: state.project,
    settings: (state.project && state.project.settings) || {}
  };
}

const mapDispatchToProps = {
  editProject: actions.editProject
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorldEditor);