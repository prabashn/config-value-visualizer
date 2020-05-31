import * as React from "react";
import { ScopedConfig } from "../models";

export interface ScopedListComponentProps<T extends ScopedConfig> {
  scopedItems: Array<T>;
  autoExpandScopes?: boolean;
  checkForRemovalEligibility?: boolean;
  canBeRemovedCheck?: (scopedValue: T) => boolean;
}

export class ScopedListComponent<
  T extends ScopedConfig
> extends React.Component<ScopedListComponentProps<T>> {
  render(): React.ReactNode {
    if (!this.props.autoExpandScopes) {
      return null;
    }

    const {
      scopedItems,
      canBeRemovedCheck,
      checkForRemovalEligibility
    } = this.props;

    return (
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
            checkForRemovalEligibility &&
            canBeRemovedCheck &&
            canBeRemovedCheck(scopedItem);

          return (
            <li key={index}>
              <span className={canBeRemoved ? "removable-scope" : ""}>
                {JSON.stringify(scopedItem.scope || "default")}
              </span>
              {scopeAnchor}
              {canBeRemoved && <span className="removable"> Redundant</span>}
            </li>
          );
        })}
      </ul>
    );
  }
}

export class ScopedPropertyListComponent extends ScopedListComponent<
  ScopedConfig
> {}