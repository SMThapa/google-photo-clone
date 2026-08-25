import axios from "axios"
import { useEffect, useState } from "react"
import { ImageCard } from "../components/ImageCard"
import { useTitle } from "../hooks/useTitle"

export const Home = () => {

    useTitle('Gallery')

    const [images, setImages] = useState([])
    const fetchData = async () => {
        try {
            const res = await axios.get('/api/media/')
            setImages(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            await fetchData()
        }
        loadData()
    }, [])

    return (
        <div className="container">
            <div className="gallary">
                {images.map(item => (
                    <ImageCard image_info={item} refetch={fetchData} key={item._id} />
                ))}
            </div>
        </div>
    )
}
