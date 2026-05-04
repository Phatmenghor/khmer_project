"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ModalMode } from "@/constants/status/status";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/shared/common/show-toast";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
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
  const isSubmitting = operations.isCreating || operations.isUpdating;

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
      form.reset();
      onClose();
    } catch (error: any) {
      showToast.error(error || "Failed to save subcategory");
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isCreate = mode === ModalMode.CREATE_MODE;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create Subcategory" : "Edit Subcategory"}
          description={isCreate ? "Add a new subcategory" : "Edit subcategory details"}
          showAvatar={false}
          isCreate={isCreate}
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Category ID" {...field} disabled={isSubmitting} />
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
                        <Input placeholder="Enter subcategory name" {...field} disabled={isSubmitting} />
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
                        <Input placeholder="Enter image URL" {...field} disabled={isSubmitting} />
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
                        <select
                          {...field}
                          disabled={isSubmitting}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={form.formState.isDirty}
              isCreate={isCreate}
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={form.formState.isDirty}
                isCreate={isCreate}
                createText="Create"
                updateText="Update"
              />
            </FormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
