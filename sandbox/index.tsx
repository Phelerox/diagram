import * as React from "react";
import { render } from "react-dom";

import { Diagram } from "../src/index";
import { NodeDefinition } from "../src/Models/NodeDefinition";
import { help } from "./help";
import { NodeOption } from "../src/Models/NodeOption";
import { Colors } from "../src/Theme/Colors";

class App extends React.Component {
  private containerRef = React.createRef<HTMLDivElement>();
  diagram?: Diagram = undefined;
  componentDidMount() {
    if (!this.containerRef.current) {
      return;
    }
    this.diagram = new Diagram(this.containerRef.current);
    const createOND = (name: string): NodeDefinition["node"] => ({
      name: `${name}Node`,
      description: `${name} object node`,
      inputs: [],
      outputs: null
    });
    const options: NodeOption[] = [
      {
        name: "required",
        help:
          "Check this if this node is required for creation of the type or is required in input | interface"
      },
      {
        name: "array",
        help:
          "Check this if you want a list here for example 'Hello' is a String however ['Hello', 'Me', 'World', 'Sloth'] its an array of strings"
      }
    ];
    const instanceOptions = options;
    const builtInScalars = ["String", "ID", "Int", "Float", "Boolean"].map(
      name =>
        ({
          node: { ...createOND(name), outputs: [] },
          description: "Scalar node",
          help: help[name],
          type: name,
          acceptsInputs: [],
          options
        } as NodeDefinition)
    );
    const builtInTypeObjects: NodeDefinition[] = ["type", "interface"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          acceptsInputs: [],
          help: help[name],
          object: true,
          instanceOptions
        } as NodeDefinition)
    );
    const builtInInputObjects: NodeDefinition[] = ["input"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          acceptsInputs: [],
          help: help[name],
          object: true,
          instanceOptions
        } as NodeDefinition)
    );
    const builtInScalarObjects: NodeDefinition[] = ["scalar"].map(
      name =>
        ({
          node: { ...createOND(name), inputs: null, outputs: null },
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: undefined,
          instanceOptions
        } as NodeDefinition)
    );
    const builtInUnionObjects: NodeDefinition[] = ["union"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: [builtInTypeObjects.find(bi => bi.type === "type")],
          instanceOptions
        } as NodeDefinition)
    );
    const builtInEnumObjects: NodeDefinition[] = ["enum"].map(
      name =>
        ({
          node: createOND(name),
          type: name,
          help: help[name],
          object: true,
          acceptsInputs: [builtInScalars.find(bi => bi.type === "String")],
          instanceOptions
        } as NodeDefinition)
    );
    const acceptedArguments = builtInScalars
      .concat(builtInTypeObjects)
      .concat(builtInEnumObjects)
      .concat(builtInScalarObjects)
      .concat(builtInUnionObjects);
    for (const scalar of builtInScalars) {
      scalar.acceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInTypeObjects) {
      object.acceptsInputs = acceptedArguments.concat(builtInInputObjects);
    }
    for (const object of builtInInputObjects) {
      object.acceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInScalarObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInEnumObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
    }
    for (const object of builtInUnionObjects) {
      object.instanceAcceptsInputs = [...acceptedArguments];
    }

    const nodeDefinitions: NodeDefinition[] = [
      ...builtInScalars,
      ...builtInTypeObjects,
      ...builtInInputObjects,
      ...builtInScalarObjects,
      ...builtInEnumObjects,
      ...builtInUnionObjects
    ];
    this.diagram!.setDefinitions(nodeDefinitions);
  }
  render() {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateRows: "auto 1fr"
        }}
      >
        <div
          style={{
            background: Colors.grey[4]
          }}
        >
          TOP BAR
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <div
            style={{
              background: Colors.grey[5],
              padding: 20,
              color: Colors.grey[3],
              width: 400
            }}
          >
            Running canvas component. Press Right mouse button anywhere on
            canvas to start adding nodes
          </div>
          <div style={{}} ref={this.containerRef} />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
