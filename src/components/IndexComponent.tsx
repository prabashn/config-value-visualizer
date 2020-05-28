import * as React from "react";
import { ConfigPropertyTree } from "../models";
import { ScopedPropertyComponent } from "./ScopedPropertyComponent";
import { loadConfigsFromIndex } from "../helpers";

export class IndexComponent extends React.Component<
  { cmsIndexId?: string; useCache: boolean },
  { loadedCmsIndexId?: string; propertyTree?: ConfigPropertyTree }
> {
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

  render(): React.ReactNode {
    const propertyTree = this.state && this.state.propertyTree;

    if (!propertyTree) {
      return (
        <div className="message">Please specify a CMS Index ID to load!</div>
      );
    }

    return <ScopedPropertyComponent property={propertyTree.root} />;
  }

  async loadState(): Promise<void> {
    const cmsIdToLoad = this.props.cmsIndexId;
    if (!cmsIdToLoad || cmsIdToLoad === this.state.loadedCmsIndexId) {
      return;
    }

    const scopedConfigs = await loadConfigsFromIndex(
      cmsIdToLoad,
      this.props.useCache
    );

    const propertyTree = new ConfigPropertyTree(scopedConfigs);
    this.setState({ propertyTree, loadedCmsIndexId: cmsIdToLoad });
  }
}
