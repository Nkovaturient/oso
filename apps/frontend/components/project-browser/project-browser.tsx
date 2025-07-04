// High level project browser UI
// Controls the access to the client and stores all state for browsing
import styles from "@/components/project-browser/css/browser.module.css";
import { ProjectDataTable } from "@/components/project-browser/project-data-table";
import { Autocomplete, TextField } from "@mui/material";
//import { Calendar, CalendarProps } from "primereact/calendar";
import React from "react";
import {
  IProjectFilter,
  IProjectsClient,
  IProjectView,
  ProjectViewsCollection,
} from "@/lib/projects";
import {
  NullSortingState,
  SortingDirection,
  SortState,
  Collection,
} from "@/lib/data-table";
import { ProjectsClientContext } from "@/components/project-browser/project-contexts";

export interface ProjectBrowserProps {
  className?: string;
}

export function ProjectBrowser(props: ProjectBrowserProps) {
  const { className } = props;
  const client = React.useContext<IProjectsClient>(ProjectsClientContext);
  //const client = new ProjectsClient();

  // Filter state
  const [filterOptions, setFilterOptions] = React.useState<
    Array<IProjectFilter>
  >([]);
  const [filterValue, setFilterValue] = React.useState<Array<IProjectFilter>>(
    [],
  );
  const [filterInputValue, setFilterInputValue] = React.useState("");

  // DateRange state
  //const [dateRangeValue, setDateRangeValue] = React.useState<Date[]>([]);
  const dateRangeValue: Date[] = [];

  // Sorting state
  const [sortState, setSortState] = React.useState<SortState>(NullSortingState);

  // Project state
  const [projects, setProjects] = React.useState<Collection<IProjectView>>(
    ProjectViewsCollection.empty(),
  );

  React.useEffect(() => {
    const load = async () => {
      if (filterOptions.length === 0) {
        setFilterOptions(await client.listFilters());
      }
      setProjects(
        await client.listProjects(filterValue, dateRangeValue, sortState),
      );
    };
    load().catch((err) => {
      // eslint-disable-next-line no-restricted-properties
      console.error("error detected getting dependents", err);
    });
  }, [client, filterValue, filterInputValue, sortState]);

  const renderFilteringControls = () => {
    return (
      <div className="control filters">
        <Autocomplete
          multiple
          limitTags={2}
          id="project-filters"
          options={filterOptions}
          getOptionLabel={(option) => option.label}
          defaultValue={[]}
          value={filterValue}
          onChange={(_event: any, newValue: Array<IProjectFilter>) => {
            setFilterValue(newValue);
          }}
          inputValue={filterInputValue}
          onInputChange={(_event, newInputValue) => {
            setFilterInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filters"
              placeholder="Project Filters"
            />
          )}
          sx={{ minWidth: "300px" }}
        />
      </div>
    );
  };

  const renderDateRangeControls = () => {
    return <></>;
    /**
    return (
      <div className="control dateRange">
        <Calendar
          value={dateRangeValue}
          onChange={onDateRangeChange}
          locale="en"
          showIcon={true}
          selectionMode="range"
          readOnlyInput
          style={{ width: 300 }}
        />
      </div>
    );
    */
  };

  const renderExportControls = () => {
    return <div className="control export"></div>;
  };

  const sortStateStateMachine = {
    [SortingDirection.Ascending]: (field: string) => {
      return { field: field, direction: SortingDirection.Descending };
    },
    [SortingDirection.Descending]: (_field: string) => {
      return NullSortingState;
    },
    [SortingDirection.None]: (field: string) => {
      return { field: field, direction: SortingDirection.Ascending };
    },
  };

  const onSortingChange = (field: string) => {
    let currentDirection = SortingDirection.None;
    // Update sorting state based on the input
    if (projects.meta.sorting.field == field) {
      currentDirection = projects.meta.sorting.direction;
    }
    const newSortState = sortStateStateMachine[currentDirection](field);
    setSortState(newSortState);
  };

  /**
  const onDateRangeChange = (e: CalendarProps) => {
    if (Array.isArray(e.value)) {
      setDateRangeValue(e.value);
    } else {
      console.error("received unexpected value from the date range picker");
    }
  };
  */

  return (
    <div className={className}>
      <div className={styles.browser}>
        <div className="controls">
          {renderFilteringControls()}
          {renderDateRangeControls()}
          {renderExportControls()}
        </div>
        <div className="view">
          <ProjectDataTable data={projects} onSortingChange={onSortingChange} />
        </div>
      </div>
    </div>
  );
}
