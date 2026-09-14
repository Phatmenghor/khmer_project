"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { Edit, Trash2, Power } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

import {
  fetchAllConfigsThunk,
  updateConfigThunk,
  deleteConfigThunk,
} from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongConfigsList,
  selectBakongConfigsPagination,
  selectBakongConfigFilters,
  selectIsBakongConfigsLoading,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { setConfigSearch, setConfigPageNo } from "@/features/bakong/store/slice/bakong-slice";
import { BakongConfigModel } from "@/features/bakong/models/bakong-models";
import { BakongConfigModal } from "@/features/bakong/components/bakong-config-modal";

export default function BakongConfigurationsPage() {
  const dispatch = useAppDispatch();
  const configs = useAppSelector(selectBakongConfigsList);
  const pagination = useAppSelector(selectBakongConfigsPagination);
  const filters = useAppSelector(selectBakongConfigFilters);
  const isLoading = useAppSelector(selectIsBakongConfigsLoading);

  const [modalState, setModalState] = useState({
    isOpen: false,
    configToEdit: null as BakongConfigModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    config: null as BakongConfigModel | null,
  });

  const loadData = async (search = filters.search, pageNo = filters.pageNo) => {
    try {
      await dispatch(fetchAllConfigsThunk({ search, pageNo, pageSize: pagination.pageSize || 15 })).unwrap();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to load configurations"));
    }
  };

  useEffect(() => {
    loadData(filters.search, filters.pageNo);
  }, [dispatch, filters.search, filters.pageNo]);

  const handleCreate = () => {
    setModalState({ isOpen: true, configToEdit: null });
  };

  const handleEdit = (config: BakongConfigModel) => {
    setModalState({ isOpen: true, configToEdit: config });
  };

  const handleDeletePrompt = (config: BakongConfigModel) => {
    setDeleteState({ isOpen: true, config });
  };

  const handleToggle = async (config: BakongConfigModel) => {
    try {
      const res = await dispatch(
        updateConfigThunk({
          id: config.id,
          payload: { ...config, enabled: !config.enabled },
        })
      ).unwrap();
      showToast.success(`Config "${res.configName}" status updated to ${res.enabled ? "ENABLED" : "DISABLED"}`);
      loadData();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to toggle status"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.config?.id) return;
    try {
      const deletedRes = await dispatch(deleteConfigThunk(deleteState.config.id)).unwrap();
      showToast.success(`Config "${deletedRes?.configName || deleteState.config.configName}" deleted successfully`);
      setDeleteState({ isOpen: false, config: null });
      loadData();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to delete config"));
    }
  };

  const columns: TableColumn<BakongConfigModel>[] = useMemo(
    () => [
      {
        key: "configName",
        label: "Config Name",
        render: (item: BakongConfigModel) => (
          <span className="font-bold text-foreground">{item.configName}</span>
        ),
      },
      {
        key: "email",
        label: "Developer Email",
        render: (item: BakongConfigModel) => <span className="text-muted-foreground">{item.email}</span>,
      },
      {
        key: "apiUrl",
        label: "API Base URL",
        render: (item: BakongConfigModel) => <span className="font-mono text-[11px] text-muted-foreground">{item.apiUrl}</span>,
      },
      {
        key: "dailyRateLimit",
        label: "Daily Limit",
        render: (item: BakongConfigModel) => (
          <span className="font-semibold text-foreground">{item.dailyRateLimit} req/day</span>
        ),
      },
      {
        key: "enabled",
        label: "Status",
        render: (item: BakongConfigModel) => (
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              item.enabled
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {item.enabled ? "ENABLED" : "DISABLED"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: BakongConfigModel) => (
          <div className="flex items-center gap-1">
            <CustomButton
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => handleToggle(item)}
              title="Toggle Status"
            >
              <Power className={`h-3.5 w-3.5 ${item.enabled ? "text-emerald-500" : ""}`} />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => handleEdit(item)}
              title="Edit Config"
            >
              <Edit className="h-3.5 w-3.5" />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleDeletePrompt(item)}
              title="Delete Config"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </CustomButton>
          </div>
        ),
      },
    ],
    []
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Bakong Upstream Configurations",
      subtitle: "Manage upstream NBC developer configurations and accounts for rate limit rotation",
      totalCount: pagination.totalElements || configs.length,
      searchValue: filters.search,
      searchPlaceholder: "Search config name, email, url...",
      onSearchChange: (e) => dispatch(setConfigSearch(e.target.value)),
      filters: [],
      buttonText: "New Config",
      buttonTooltip: "Add new Bakong configuration",
      onButtonClick: handleCreate,
    }),
    [pagination.totalElements, configs.length, filters.search, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterConfig} />

      <DataTableWithPagination
        data={configs}
        columns={columns}
        loading={isLoading}
        emptyMessage="No Bakong configurations found"
        getRowKey={(config) => config.id}
        currentPage={pagination.pageNo || 1}
        totalPages={pagination.totalPages || 1}
        totalElements={pagination.totalElements || 0}
        onPageChange={(page) => dispatch(setConfigPageNo(page))}
        pageSize={pagination.pageSize || 15}
        onPageSizeChange={() => {}}
      />

      <BakongConfigModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, configToEdit: null })}
        configToEdit={modalState.configToEdit}
        onSuccess={() => loadData()}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, config: null })}
        onDelete={handleDeleteConfirm}
        title="Delete Bakong Configuration"
        description={`Are you sure you want to delete config "${deleteState.config?.configName || ""}" (${deleteState.config?.email || ""})?`}
        itemName={deleteState.config?.configName || ""}
      />
    </div>
  );
}
