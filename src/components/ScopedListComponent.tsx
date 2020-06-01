import * as React from "react";
import { ScopedConfig } from "../models";

export interface ScopedListComponentProps<T extends ScopedConfig> {
  scopedItems: Array<T>;
  canBeRemovedCheck?: (scopedValue: T) => boolean;
  autoExpandScopes?: boolean;
}

export interface ScopedListComponentState {
  /**
   * for storing and comparing incoming props to previous props to see
   * if we're about to re-render due to a prop change
   */
  prevProps?: ScopedListComponentProps<any>;
  scopeVisibility: boolean | null;
}

export class ScopedListComponent<
  T extends ScopedConfig
> extends React.Component<
  ScopedListComponentProps<T>,
  ScopedListComponentState
> {
  constructor(props: ScopedListComponentProps<T>) {
    super(props);

    this.state = {
      prevProps: this.props,
      scopeVisibility: !!this.props.autoExpandScopes
    };
  }

  static getDerivedStateFromProps(
    props: ScopedListComponentProps<any>,
    state: ScopedListComponentState
  ): ScopedListComponentState | null {
    // if we detect that the new props are different from the previously stored
    // props in state, that means props have been changed by parent, and we're going to re-render.
    // In this case, we want to make sure we use the props value for scope visibility.
    if (props !== state.prevProps) {
      return {
        prevProps: props,
        scopeVisibility: !!props.autoExpandScopes
      };
    }

    // otherwise, use the values already in state -- no overrides needed
    return null;
  }

  render(): React.ReactNode {
    const { scopedItems, canBeRemovedCheck } = this.props;
    const { scopeVisibility } = this.state;

    if (!scopeVisibility) {
      return (
        <input type="button" value="Show scopes" onClick={this.toggleScopes} />
      );
    }

    return (
      <React.Fragment>
        <input type="button" value="Hide scopes" onClick={this.toggleScopes} />
        <ul>
          {scopedItems.map((scopedItem, index) => {
            const scopeHref = scopedItem.config && scopedItem.config._id;
            const scopeAnchor = scopeHref ? (
              <React.Fragment>
                (
                <a
                  href={`https://www.msncms.microsoft.com/amp/document/${scopeHref}?mode=json`}
                  target="_new"
                >
                  {scopeHref}
                </a>
                )
              </React.Fragment>
            ) : null;

            const canBeRemoved =
              canBeRemovedCheck && canBeRemovedCheck(scopedItem);

            return (
              <li key={index} className={canBeRemoved ? "removable-scope" : ""}>
                <span className="scope">
                  {JSON.stringify(scopedItem.scope || "default")}
                </span>
                {scopeAnchor}
                {canBeRemoved && <span className="redundant"> Redundant</span>}
              </li>
            );
          })}
        </ul>
      </React.Fragment>
    );
  }

  private toggleScopes = (): void => {
    this.setState({
      ...this.state,
      scopeVisibility: !this.state.scopeVisibility
    });
  };
}

export class ScopedPropertyListComponent extends ScopedListComponent<
  ScopedConfig
> {}
