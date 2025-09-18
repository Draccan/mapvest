import { Request, Response } from "express";

export interface MapPoint {
    id?: number;
    x: number;
    y: number;
    type: "Furto" | "Aggressione" | "Rapina";
    date: string;
    created_at?: Date;
}

// Temporary in-memory storage for development
let mapPoints: MapPoint[] = [
    {
        id: 1,
        x: 41.9028,
        y: 12.4964,
        type: "Furto",
        date: "01/01/2024",
        created_at: new Date(),
    },
    {
        id: 2,
        x: 41.9109,
        y: 12.4818,
        type: "Aggressione",
        date: "02/01/2024",
        created_at: new Date(),
    },
];

export const getAllMapPoints = async (req: Request, res: Response) => {
    try {
        res.json({
            success: true,
            data: mapPoints,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch map points",
        });
    }
};

export const createMapPoint = async (req: Request, res: Response) => {
    try {
        const { x, y, type, date } = req.body;

        if (!x || !y || !type || !date) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: x, y, type, date",
            });
        }

        const newMapPoint: MapPoint = {
            id: mapPoints.length + 1,
            x: parseFloat(x),
            y: parseFloat(y),
            type,
            date,
            created_at: new Date(),
        };

        mapPoints.push(newMapPoint);

        res.status(201).json({
            success: true,
            data: newMapPoint,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to create map point",
        });
    }
};
