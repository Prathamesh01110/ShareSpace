'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditSpace({ id }: { id: string }) {
    const router = useRouter();

    useEffect(() => {
        router.push(`/becomeHost/createSpace/${id}`);
    }, [id]);

    return <div>Redirecting...</div>; // Temporary UI before redirect
}