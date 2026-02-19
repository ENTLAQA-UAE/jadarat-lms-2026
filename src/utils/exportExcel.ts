import { ReactNode } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


type Data = {
    [key: string]: any;
};



export const exportToExcel = (data: any, fileName: string) => {
    // Filter out fields containing thumbnails or images
    const filteredData = data.map((item: any) => {
        const newItem: Data = {};
        for (const key in item) {
            if (!key.toLowerCase().includes('thumbnail') && !key.toLowerCase().includes('category_image') && !key.toLowerCase().includes('image')) {
                newItem[key] = item[key];
            }
        }
        return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${fileName}.xlsx`);
};
