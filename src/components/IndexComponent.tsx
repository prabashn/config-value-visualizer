import * as React from "react";

import { ConfigRef, IndexType, ScopedProperty } from "../models";

import { ScopedPropertyComponent } from "./ScopedPropertyComponent";
import { isEqual } from "lodash-es";
import { isValidConfigRef } from "../helpers";
import { loadConfigsFromIndex } from "../services";

export interface IndexComponentProps {
  //cmsIndexId?: string;
  configRef: ConfigRef;
  useCache: boolean;
  flattenArrays?: boolean;
  autoExpandScopes?: boolean;
  showPropertiesOnly?: boolean;
  flightFilter: "no-flights" | "only-flights" | "with-flights"
}

export interface IndexComponentState {
  index?: IndexType;
  propertyTree?: ScopedProperty;
  loadedProps?: IndexComponentProps;
}

export class IndexComponent extends React.Component<
  IndexComponentProps,
  IndexComponentState
> {
  private renderCount = 0;

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.loadState();
  }

  componentDidUpdate() {
    this.loadState();
  }

  shouldComponentUpdate(
    nextProps: IndexComponentProps,
    nextState: IndexComponentState
  ) {
    return (
      // if our property tree instance has changed between current and next state, return true
      this.state.propertyTree !== nextState.propertyTree ||
      // OR
      // if the incoming props are not equal to the ones we have loaded,
      // that means we have to return true, so that:
      //  1) normal render happens due to the prop change - unfortunately will
      //    go through a unnecessary tree reconciliation :( Not sure how to avoid this.
      //  2) componentDidUpdate will get called, and also call our loadState method.
      //  3) since we always "async load" the data, it will trigger a new render
      //    after the async load finishes.
      !isEqual(nextProps, this.state.loadedProps)
    );
  }

  render(): React.ReactNode {
    if (!isValidConfigRef(this.props.configRef)) {
      return (
        <div className="message">Please specify valid App Type / Shared Namespace / Experience Type / Instance ID load!</div>
      );
    }

    const propertyTree = this.state && this.state.propertyTree;
    if (!propertyTree) {
      return <div className="message">Loading... Please wait</div>;
    }

    return (
      <React.Fragment>
        {/* <span>Render count = {++this.renderCount}</span> */}
        <h2>{this.state.index?.experienceType}</h2>
        <ScopedPropertyComponent
          property={propertyTree}
          autoExpandScopes={this.props.autoExpandScopes}
          visibilityDepth={this.props.autoExpandScopes ? 0 : 1000}
        />
      </React.Fragment>
    );
  }

  async loadState(): Promise<void> {
    if (!isValidConfigRef(this.props.configRef) || isEqual(this.props, this.state.loadedProps)) {
      return;
    }

    const loadedConfigs = await loadConfigsFromIndex(
      this.props.configRef,
      this.props.useCache
    );

    const { flightFilter, showPropertiesOnly, flattenArrays } = this.props;
    let propertyTree = new ScopedProperty(showPropertiesOnly ? "properties" : "config", null, false);

    for (const config of loadedConfigs.configs) {
      
      const hasFlight = config.scope && config.scope.experimentId;
      
      if (hasFlight ) {
        if (flightFilter === "no-flights") {
          continue;
        }
      } else {
        if (flightFilter === "only-flights") {
          continue;
        }
      }

      const configProperty = ScopedProperty.parseObject(
        propertyTree.key,
        showPropertiesOnly ? config.config.properties : config.config,
        config,
        false,
        !!flattenArrays
      );

      propertyTree.merge(configProperty);
    }

    this.setState({
      index: loadedConfigs.index,
      propertyTree,
      loadedProps: this.props
    });
  }
}