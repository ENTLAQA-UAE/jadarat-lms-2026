// filterUtils.ts
export const dateRangeFilterFn = (row: any, columnId: string, filterValue: { startDate: Date | null, endDate: Date | null }) => {
    const cellValue = row.getValue(columnId) as Date;

    if (!cellValue || !filterValue.startDate || !filterValue.endDate) {
        return true; // No filtering if startDate or endDate is not set
    }

    return cellValue >= filterValue.startDate && cellValue <= filterValue.endDate;
};
