import * as React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';

import { pageThumbnailPlugin } from './pageThumbnailPlugin';

interface DisplayThumbnailProps {
    fileUrl: string;
    pageIndex: number;
    width?: number;
}

const DisplayThumbnail: React.FC<DisplayThumbnailProps> = ({ fileUrl, pageIndex, width = 380 }) => {
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Cover } = thumbnailPluginInstance;
    const pageThumbnailPluginInstance = pageThumbnailPlugin({
        PageThumbnail: <div className='w-full h-full justify-center items-center flex'>
            <Cover getPageIndex={() => pageIndex} width={width} />
        </div>,
    });

    return <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl} plugins={[pageThumbnailPluginInstance, thumbnailPluginInstance]} />
    </Worker>
};

export default DisplayThumbnail;