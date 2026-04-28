"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode } from "@/constants/status/status";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/shared/common/show-toast";
import { SubcategoriesResponseModel } from "../store/models/response/subcategories-response";
import { createSubcategoriesSchema, CreateSubcategoriesData } from "../store/models/schema/subcategories-schema";
import { createSubcategory, updateSubcategory } from "../store/thunks/subcategories-thunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectOperations } from "../store/selectors/subcategories-selector";

interface SubcategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: SubcategoriesResponseModel | null;
  mode: ModalMode;
}

export default function SubcategoriesModal({
  isOpen,
  onClose,
  subcategory,
  mode,
}: SubcategoriesModalProps) {
  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectOperations);

  const form = useForm<CreateSubcategoriesData>({
    resolver: zodResolver(createSubcategoriesSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      imageUrl: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isOpen && subcategory && mode === ModalMode.UPDATE_MODE) {
      form.reset({
        categoryId: subcategory.categoryId,
        name: subcategory.name,
        imageUrl: subcategory.imageUrl,
        status: subcategory.status,
      });
    } else if (isOpen && mode === ModalMode.CREATE_MODE) {
      form.reset({
        categoryId: "",
        name: "",
        imageUrl: "",
        status: "ACTIVE",
      });
    }
  }, [isOpen, subcategory, mode, form]);

  const onSubmit = async (data: CreateSubcategoriesData) => {
    try {
      if (mode === ModalMode.CREATE_MODE) {
        await dispatch(createSubcategory(data)).unwrap();
        showToast.success("Subcategory created successfully");
      } else {
        await dispatch(updateSubcategory({
          subcategoriesId: subcategory?.id || "",
          subcategoriesData: data,
        })).unwrap();
        showToast.success("Subcategory updated successfully");
      }
      onClose();
    } catch (error: any) {
      showToast.error(error || "Failed to save subcategory");
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === ModalMode.CREATE_MODE ? "Create Subcategory" : "Edit Subcategory"}
      description={mode === ModalMode.CREATE_MODE ? "Add a new subcategory" : "Edit subcategory details"}
      onSubmit={form.handleSubmit(onSubmit)}
      submitButtonText="Save"
      isSubmitting={operations.isCreating || operations.isUpdating}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category ID</FormLabel>
                <FormControl>
                  <Input placeholder="Category ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter subcategory name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input as="select" {...field}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CustomModal>
  );
}
