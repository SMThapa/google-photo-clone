import axios from "axios";
import { MdOutlineDelete } from "react-icons/md";
import { toast } from "react-toastify";
export const ImageCard = ({ image_info, refetch }) => {

    const handleDelete = async (ids) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${ids.length} image?`
        );

        if (!confirmed) return;

        try {
            await toast.promise(
                axios.delete("/api/media", {
                    data: { ids },
                }),
                {
                    pending: "Deleting images...",
                    success: "Images deleted",
                    error: "Failed to delete images",
                }
            );

            await refetch();
        } catch (error) {
            console.log(error.response?.data || error);
        }
    };

    return (
        <div className="image_card">
            <img
                src={image_info.imageUrl}
                alt={image_info.image_name}
                typeof={image_info.mimeType}
                loading="lazy"
            />
            <div className="text_content">
                <p>{image_info.image_name}</p>
                <MdOutlineDelete onClick={() => handleDelete([image_info._id])} />
            </div>
        </div>
    )
}
