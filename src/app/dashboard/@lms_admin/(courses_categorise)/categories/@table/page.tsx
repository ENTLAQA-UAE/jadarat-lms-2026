import CategoryTable from '../categories-table/CategoryTable';
import {  fetchAllCategoriesFiltered } from '@/action/categories/categoriesActions';

interface SearchParams {
  page?: string;
  category?: string;
  name?: string;
}

export default async function CategoryDataTablePage({ searchParams, userRole }: { searchParams: SearchParams, userRole?: string }) {
  
  const page = parseInt(searchParams.page ?? '1', 10);
  const pageSize = 10;
  
  const filters = {
    name: searchParams.name ?? null,
  };
  
  const { data, count } = await fetchAllCategoriesFiltered(filters, page, pageSize);
  return (
    <CategoryTable
      AllCategories={data}
      page={page}
      pageSize={pageSize}
      filters={filters}
      count={count ?? 0}
    />
  );
}