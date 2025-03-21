"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, use } from "react";
import { X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadPhotos } from "@/app/actions/uploadPhotos";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MIN_PHOTOS = 4;
const MAX_PHOTOS = 20;

const uploadPhotosSchema = z.object({
    photos: z
        .array(z.any()) // No need for detailed validation here
        .min(MIN_PHOTOS, { message: `Please upload at least ${MIN_PHOTOS} photos` })
        .max(MAX_PHOTOS, { message: `Maximum ${MAX_PHOTOS} photos allowed` }),
});

export type UploadPhotosValues = z.infer<typeof uploadPhotosSchema>;

interface PhotoItem {
    file: File;
    url: string;
    id: string;
}

export default function UploadPhotos(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const spaceId = params.id;
    const router = useRouter();
    const [photosList, setPhotosList] = useState<PhotoItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        handleSubmit,
        setValue,
        formState: { errors },
        trigger,
    } = useForm<UploadPhotosValues>({
        resolver: zodResolver(uploadPhotosSchema),
        defaultValues: {
            photos: [],
        },
    });

    const validateFile = (file: File) => {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            alert("Unsupported file type. Please upload JPEG, PNG, or WebP images.");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert("File size must be less than 5MB.");
            return false;
        }
        return true;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const totalPhotos = photosList.length + e.target.files.length;
            if (totalPhotos > MAX_PHOTOS) {
                alert(`Maximum ${MAX_PHOTOS} photos allowed.`);
                return;
            }

            const validFiles = Array.from(e.target.files).filter(validateFile);
            const newPhotos = validFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
                id: crypto.randomUUID(),
            }));

            const updatedPhotos = [...photosList, ...newPhotos];
            setPhotosList(updatedPhotos);
            setValue("photos", updatedPhotos);
            trigger("photos");
        }
    };

    const removePhoto = (id: string) => {
        const photoToRemove = photosList.find((photo) => photo.id === id);
        if (photoToRemove) {
            URL.revokeObjectURL(photoToRemove.url);
        }
        const updatedPhotos = photosList.filter((photo) => photo.id !== id);
        setPhotosList(updatedPhotos);
        setValue("photos", updatedPhotos);
        trigger("photos");
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData("text/plain"));
        if (dragIndex === dropIndex) return;

        const newPhotosList = [...photosList];
        const draggedItem = newPhotosList[dragIndex];
        newPhotosList.splice(dragIndex, 1);
        newPhotosList.splice(dropIndex, 0, draggedItem);

        setPhotosList(newPhotosList);
        setValue("photos", newPhotosList);
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            photosList.forEach((photo) => {
                formData.append("files", photo.file);
            });

            const uploadedUrls = await uploadPhotos(formData, spaceId);
            console.log("Uploaded URLs:", uploadedUrls); // Display or use these URLs

            router.push(`/becomeHost/operatingHours/${spaceId}`);
        } catch (error) {
            console.error("Error uploading photos:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return <>
        <nav className={"w-full z-50 transition-all duration-300 fixed top-0 bg-black/90"}>
            <div className="flex items-center justify-between px-6 py-2 mx-auto">
                <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl sm:text-4xl font-bold text-white py-4 sm:p-3">SpaceShare</span>
                </Link>
                <span className="text-white text-lg mr-10  font-medium">Space Details</span>
            </div>
        </nav>
        <main>
            <div className="lg:w-[58%] w-[85%] md:w-[80%] pt-32 flex-col flex mx-auto">
            <form className="flex flex-col space-y-4 w-full">
                <h1 className="text-3xl font-extrabold pb-2">Upload photos of your space</h1>
                <span className="text-sm text-gray-800 pb-2">
                    Photos are the first thing that guests will see. We recommend adding 10 or more high-quality photos.
                </span>
                <span className="font-bold text-sm pb-2">Photo requirements:</span>
                <ul className="list-disc list-inside text-sm font-normal text-gray-800 gap-2 flex flex-col pb-4">
                    <li><b>High resolution -</b> At least 1,000 pixels wide</li>
                    <li><b>Horizontal orientation -</b> No vertical photos</li>
                    <li><b>Color photos -</b> No black & white</li>
                    <li><b>Misc. -</b> No collages, screenshots, or watermarks</li>
                </ul>

                {photosList.length === 0 ? (
                    <div className="flex flex-col md:w-2/3 items-center border py-20 gap-8">
                        <span className="text-sm text-gray-800">Please add at least 4 space photos</span>
                        <Button
                            type="button"
                            className="rounded-none"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="md:w-2/3">
                        <div className="grid sm:grid-cols-3 gap-4 mb-4">
                            {photosList.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className="relative group"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-40 object-cover border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(photo.id)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                    {index === 0 && (
                                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1">
                                            Cover Photo
                                        </span>
                                    )}
                                </div>
                            ))}
                            <div
                                className="flex flex-col items-center justify-center border h-40 cursor-pointer hover:bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className="text-lg">+</span>
                                <span className="text-sm text-gray-500">Add more</span>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />

                        {errors.photos && (
                            <p className="text-red-500 text-sm">{errors.photos.message}</p>
                        )}
                    </div>
                )}

                <span className="flex flex-wrap md:w-2/3 text-gray-600 text-md pt-4">
                    Drag and drop your photos to change the order. Your first photo is what your guests will see when browsing, so make sure it represents your space.
                </span>
                <hr className="border-t border-gray-200 mt-16 mb-10" />
                <div className="w-full flex justify-between mb-16">
                    <Link href={`/becomeHost/typeOfSpace/${spaceId}`}>
                        <Button variant="outline" className="text-md font-semibold">Back</Button>
                    </Link>
                    <Button
                        className="text-md font-semibold bg-[#8559EC] hover:bg-[#7248d1]"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Next'
                        )}
                    </Button>
                </div>
            </form>
        </div>
        </main>
</>
}
