import React, { ReactNode } from "react";

import styles from "@/components/project-browser/css/data-table.module.css";
import {
  RawCollection,
  DataTableConfig,
  DataTableHeaderComponent,
  DataTableField,
  Collection,
  ViewType,
} from "@/lib/data-table";
import { IProjectView } from "@/lib/projects";
import {
  ProjectDataTableContext,
  IProjectDataTableControl,
  ProjectExpandedContext,
} from "@/components/project-browser/project-contexts";
import { Expandable } from "@/components/project-browser/data-table/expandable";
import { DataTableFieldDefaultLabel } from "@/components/project-browser/data-table/field-label";
import { DataTableFieldDefault } from "@/components/project-browser/data-table/field-default";

export interface DataTableProps<T extends ViewType> {
  className?: string;
  children?: ReactNode;
  renderWithTestData?: boolean;
  data: Collection<T>;
  testData?: RawCollection;
  sortAsc?: boolean;
  config: DataTableConfig;
  onSortingChange?: (fieldName: string) => void;
  onExpand?: (fieldName: string, data: any, field: DataTableField) => void;
}

export function DataTable<T extends ViewType>(props: DataTableProps<T>) {
  const [expandedId, setExpandedId] = React.useState("");
  const [fieldExpanded, setFieldExpanded] = React.useState("");

  const { className, data, config, children } = props;

  const renderHeader = () => {
    return (
      <thead>
        <tr>
          {config.fieldOrder.map((fieldName) => {
            const field = config.fields[fieldName];
            const typeConfig = config.types[field.type];
            let HeaderComponent: DataTableHeaderComponent =
              DataTableFieldDefaultLabel;
            if (typeConfig?.headerComponent !== undefined) {
              HeaderComponent = typeConfig.headerComponent;
            }
            return (
              <td
                key={fieldName}
                className={fieldName}
                style={{ minWidth: field.minWidth, textAlign: field.textAlign }}
              >
                <div className="cell">
                  <HeaderComponent key={fieldName} field={field} />
                </div>
              </td>
            );
          })}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    if (data.items.length === 0) {
      return (
        <tbody>
          <tr className="empty">
            <td colSpan={config.fieldOrder.length}>No results</td>
          </tr>
        </tbody>
      );
    }
    const onExpand = (data: IProjectView, field: DataTableField) => {
      if (expandedId == data.id && fieldExpanded == field.name) {
        setExpandedId("");
        setFieldExpanded("");
      } else {
        setExpandedId(data.id);
        setFieldExpanded(field.name);
      }
    };

    return (
      <tbody>
        {data.items.map((item) => {
          let expandedArea = <></>;
          let rowClassName = "expandable";
          if (item.id === expandedId) {
            expandedArea = (
              <>
                <ProjectExpandedContext.Provider
                  value={{ data: item, field: config.fields[fieldExpanded] }}
                >
                  {children}
                </ProjectExpandedContext.Provider>
              </>
            );
            rowClassName += " expanded";
          }
          return (
            <>
              <tr className="item" key={item.id}>
                {config.fieldOrder.map((fieldName) => {
                  const field = config.fields[fieldName];
                  const typeConfig = config.types[field.type];
                  let CellComponent = DataTableFieldDefault;
                  if (typeConfig?.cellComponent !== undefined) {
                    CellComponent = typeConfig.cellComponent;
                  }
                  return (
                    <td
                      key={fieldName}
                      className={fieldName}
                      style={{
                        minWidth: field.minWidth,
                        textAlign: field.textAlign,
                      }}
                    >
                      <div className="cell">
                        <CellComponent
                          key={fieldName}
                          field={field}
                          value={item[fieldName]}
                          data={item}
                          style={{ display: "inline" }}
                        />
                        <Expandable
                          isExpanded={
                            expandedId == item.id && fieldExpanded == fieldName
                          }
                          field={field}
                          data={item}
                          onExpand={onExpand}
                        ></Expandable>
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr
                className={rowClassName}
                key={item.id + "-expanded"}
                style={{
                  display: item.id == expandedId ? "table-row" : "none",
                }}
              >
                <td colSpan={7}>{expandedArea}</td>
              </tr>
            </>
          );
        })}
      </tbody>
    );
  };

  const control: IProjectDataTableControl = {
    onSortChange: (field) => {
      console.log(field);
      if (props.onSortingChange) {
        props.onSortingChange(field);
      }
    },
    sorting: data.meta.sorting,
  };

  return (
    <div className={className}>
      <ProjectDataTableContext.Provider value={control}>
        <table className={styles["project-data-table"]}>
          {renderHeader()}
          {renderBody()}
        </table>
      </ProjectDataTableContext.Provider>
    </div>
  );
}
