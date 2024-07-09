import { CategoryModel } from '../../category/models/category.model';

export class SubCategoryModel {
  category_sub_id!: number;
  category_id!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
  category!: CategoryModel;

  setSubCategory(_category: unknown) {
    const subcategory = _category as SubCategoryModel;
    this.category_sub_id = subcategory.category_sub_id;
    this.category_id = subcategory.category_id;
    this.name = subcategory.name || '';
    this.createdAt = subcategory.createdAt;
    this.updatedAt = subcategory.updatedAt;
  }
}
