"use server"
import { fulldomain } from '@/utils/getFullDomain';
import axios from 'axios'

export const getImageURL = async (id: number) => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_PLACID_DOMAIN}/images/${id}?placid-custom-cors-header=*`, {
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PLACID_KEY}`
        }
    })
    return data;
}

export async function generateImage({ uuid, logo, title, sign, color }: { uuid: string, logo: string, title: string, sign: string, color: string }) {

    return await axios.post(`${process.env.NEXT_PUBLIC_PLACID_DOMAIN}/images?placid-custom-cors-header=*`, {
        template_uuid:
            uuid,
        layers: {
            logo: {
                image: logo
            },
            author_title: {
                text: title
            },
            name: {
                text: "Student Name"
            },
            date: {
                text: new Date().toLocaleDateString('en-GB') // formats to dd/mm/yyyy
            },
            qr_code: {
                value: "#"
            },
            signature: {
                image: sign
            },
            bg: {
                "background_color": color
            },
            course_name: {
                text: "Course Name"
            }

        }
    }, {
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PLACID_KEY}`
        }
    })
}

export const getPDFURL = async (id: number) => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_PLACID_DOMAIN}/pdfs/${id}?placid-custom-cors-header=*`, {
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PLACID_KEY}`
        }
    })
    return data;
}

export async function generatePdf({ uuid, logo, title, sign, color, studentName, courseName, studentId, courseId }: { uuid: string, logo: string, title: string, sign: string, color: string, studentName: string, courseName: string, studentId?: string, courseId?: number }) {
    const isLocal = process.env.NODE_ENV === "development";
    const certificateUrl = isLocal ? `http://localhost:3000/certificates-qr?s=${encodeURIComponent(studentId!)}&c=${encodeURIComponent(courseId!)}` : `https://${fulldomain}/certificates-qr?s=${encodeURIComponent(studentId!)}&c=${encodeURIComponent(courseId!)}`;

    const sanitizedFileName = `${studentName.replace(/[^a-zA-Z0-9]/g, '-')}-${courseName.replace(/[^a-zA-Z0-9]/g, '-')}`;

    const data  = await axios.post(`${process.env.NEXT_PUBLIC_PLACID_DOMAIN}/pdfs?placid-custom-cors-header=*`, {
        pages: [
            {
                template_uuid: uuid,
                layers: {
                    logo: {
                        image: logo
                    },
                    author_title: {
                        text: title
                    },
                    name: {
                        text: studentName
                    },
                    date: {
                        text: new Date().toLocaleDateString('en-GB')
                    },
                    qr_code: {
                        value: certificateUrl
                    },
                    signature: {
                        image: sign
                    },
                    bg: {
                        "background_color": color
                    },
                    course_name: {
                        text: courseName
                    }

                },
            }
        ],
        transfer: {
            to: "s3",
            key: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
            secret: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS,
            region: "eu-north-1",
            bucket: "entlaqa-lms-certificates",
            visibility: "public",
            path: `certificates/${sanitizedFileName}.pdf`,
            endpoint: "https://s3.eu-north-1.amazonaws.com",
            acl: "public-read"
        }
    }, {
        headers: {
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_PLACID_KEY}`
        }
    })
    console.log("data =>>", data)
    return data;
}
