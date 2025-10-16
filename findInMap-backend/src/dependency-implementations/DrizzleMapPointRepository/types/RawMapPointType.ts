import { MapPoint } from "../../../db/schema";

export default interface RawMapPoint extends Omit<MapPoint, "location"> {
    long: number;
    lat: number;
}
