import * as React from "react";
import { ScopedProperty } from "../models";
import { ScopedPropertyComponent } from "./ScopedPropertyComponent";
import { loadConfigsFromIndex } from "../services";
import { isEqual } from "lodash-es";

export interface IndexComponentProps {
  cmsIndexId?: string;
  useCache: boolean;
  flattenArrays?: boolean;
  autoExpandScopes?: boolean;
}

export interface IndexComponentState {
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
    const propertyTree = this.state && this.state.propertyTree;

    if (!propertyTree) {
      return (
        <div className="message">Please specify a CMS Index ID to load!</div>
      );
    }

    return (
      <React.Fragment>
        {/* <span>Render count = {++this.renderCount}</span> */}
        <ScopedPropertyComponent
          property={propertyTree}
          autoExpandScopes={this.props.autoExpandScopes}
          visibilityDepth={this.props.autoExpandScopes ? 1000 : 0}
        />
        ;
      </React.Fragment>
    );
  }

  async loadState(): Promise<void> {
    if (!this.props.cmsIndexId || isEqual(this.props, this.state.loadedProps)) {
      return;
    }

    const scopedConfigs = await loadConfigsFromIndex(
      this.props.cmsIndexId,
      this.props.useCache
    );

    let propertyTree = new ScopedProperty("properties", null, false);

    for (const config of scopedConfigs) {
      const configProperty = ScopedProperty.parseObject(
        propertyTree.key,
        config.config.properties,
        config,
        false,
        !!this.props.flattenArrays
      );

      propertyTree.merge(configProperty);
    }

    this.setState({ propertyTree, loadedProps: this.props });
  }
}
