import React, { useEffect } from "react";
import { NavBar } from "~/components/navbar";

const UsingFetch = () => {
    const [items, setItems] = React.useState<any[]>([])

    const fetchData = () => {
        fetch("/api/items")
            .then(response => {
                return response.json()
            })
            .then(data => {
                setItems(data)
            })
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
        <NavBar/>
        <div>
            {items.length > 0 && (
                <table className="table-auto">
                    <thead>
                        <tr>
                            <th>ItemID</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.ItemID}>
                                <td>{item.ItemID}</td>
                                <td>{item.ItemTitle}</td>
                                <td>{item.TypeName}</td>
                                <td>{item.ItemStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        </>
    )
}

export default UsingFetch