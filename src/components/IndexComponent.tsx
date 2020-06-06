import * as React from "react";
import { ScopedProperty, IndexType } from "../models";
import { ScopedPropertyComponent } from "./ScopedPropertyComponent";
import { loadConfigsFromIndex } from "../services";
import { isEqual } from "lodash-es";

export interface IndexComponentProps {
  cmsIndexId?: string;
  useCache: boolean;
  flattenArrays?: boolean;
  autoExpandScopes?: boolean;
  showPropertiesOnly?: boolean;
  showFlightConfigs?: boolean;
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
    if (!this.props.cmsIndexId) {
      return (
        <div className="message">Please specify a CMS Index ID to load!</div>
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
    if (!this.props.cmsIndexId || isEqual(this.props, this.state.loadedProps)) {
      return;
    }

    const loadedConfigs = await loadConfigsFromIndex(
      this.props.cmsIndexId,
      this.props.useCache
    );

    const { showFlightConfigs, showPropertiesOnly, flattenArrays } = this.props;
    let propertyTree = new ScopedProperty(showPropertiesOnly ? "properties" : "config", null, false);

    for (const config of loadedConfigs.configs) {
      if (!showFlightConfigs && config.scope && config.scope.experimentId) {
        continue;
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
