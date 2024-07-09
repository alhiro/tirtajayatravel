export class CategoryModel {
  category_id!: number;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  setCategory(_category: unknown) {
    const category = _category as CategoryModel;
    this.category_id = category.category_id;
    this.name = category.name || '';
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}
