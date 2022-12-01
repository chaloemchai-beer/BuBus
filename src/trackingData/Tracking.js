import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const Tracking = () => {
  const [location, setLocation] = useState([]);
  const locationCollectionRef = collection(db, "locationTracking");

  useEffect(() => {
    const locationTracking = async () => {
      const data = await getDocs(locationCollectionRef);
      setLocation(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    locationTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const AddLocationTracking = async () => {
    await addDoc(locationCollectionRef, {
      locationName: AddNameLocation,
      lat: AddLat,
      lng: AddLng,
    });
    alert("Success");
  };

  const ShowOutput = () => {
    alert("Show");
    location.map((data) => console.log(data));
  };
  const [AddNameLocation, setAddNameLocation] = useState("");
  const [AddLat, setAddLat] = useState(0);
  const [AddLng, setAddLng] = useState(0);

  const UpdateLocationTracking = async () => {
    const userDoc = doc(db, locationCollectionRef, "JU9wNurz9UOb1MFmxp2j");
    const newField = {
      locationName: AddNameLocation,
      lat: AddLat,
      lng: AddLng,
    };
    await updateDoc(userDoc, newField);
  };

  return (
    <>
      {/* <input onChange={(e) => setAddNameLocation(e.target.value)} />
      <input onChange={(e) => setAddLat(e.target.value)} />
      <input onChange={(e) => setAddLng(e.target.value)} />

      <button onClick={UpdateLocationTracking}>OO</button>
      <button onClick={ShowOutput}>OO00</button> */}
    </>
  );
};

export default Tracking;
