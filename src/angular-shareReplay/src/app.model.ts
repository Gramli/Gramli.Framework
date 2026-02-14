export interface Vehicle {
    _id: string;
    name: string;
    description: string;
    image: string;
}

export interface VehiclesApiResponse {
    data: Vehicle[];
}