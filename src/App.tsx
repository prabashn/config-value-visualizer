import * as React from "react";
import "./styles.css";
import { IndexComponent } from "./components";

export class App extends React.Component<
  {},
  { cmsIndexId?: string; useCache: boolean }
> {
  private readonly txtCmsIdRef = React.createRef<HTMLInputElement>();
  private readonly chkDisableCacheRef = React.createRef<HTMLInputElement>();

  constructor(props: any) {
    super(props);
    this.state = { useCache: true };
  }

  render(): React.ReactNode {
    const { cmsIndexId, useCache } = this.state;
    return (
      <div className="app">
        <h1>CMS Config Visualizer</h1>
        {this.renderInputForm()}
        <IndexComponent
          key={cmsIndexId}
          cmsIndexId={cmsIndexId}
          useCache={useCache}
        />
      </div>
    );
  }

  renderInputForm(): React.ReactNode {
    return (
      <div className="app-input">
        <div className="input">
          <label>CMS Index ID: </label>
          <input type="text" ref={this.txtCmsIdRef} />
        </div>
        <div className="input">
          <label>Disable cache: </label>
          <input type="checkbox" ref={this.chkDisableCacheRef} />
        </div>{" "}
        <div className="input">
          <label />
          <button onClick={this.onLoadConfigIndex}>Load!</button>
          <button onClick={this.onLoadDefault}>Load Default!</button>
        </div>
      </div>
    );
  }

  onLoadConfigIndex = () => {
    if (
      !this.txtCmsIdRef ||
      !this.txtCmsIdRef.current ||
      !this.chkDisableCacheRef ||
      !this.chkDisableCacheRef.current
    ) {
      return;
    }

    this.setState({
      cmsIndexId: this.txtCmsIdRef.current.value as string,
      useCache: !(this.chkDisableCacheRef.current.checked as boolean)
    });
  };

  onLoadDefault = () => {
    if (!this.txtCmsIdRef || !this.txtCmsIdRef.current) {
      return;
    }

    this.txtCmsIdRef.current.value = "BBUsYQa";
    this.onLoadConfigIndex();
  };
}
