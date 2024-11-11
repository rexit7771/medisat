"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RecordType } from "@/app/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "./loading";
import { handleLogout } from "./actions";

const logo = require("@/app/assets/MEDISAT.png");

export default function Medis() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");
  const status_code = searchParams.get("status_code");
  const [record, setRecord] = useState<RecordType[]>([]);
  const router = useRouter();
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    if (status_code === "200") {
      fetch(process.env.NEXT_PUBLIC_BASE_URL + `/api/payments/${order_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        router.push("/patients");
      });
    }
  }, [status_code, order_id]);

  async function getRecord() {
    const records = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/patients/records",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        cache: "no-store",
      }
    );
    if (!records.ok) {
      throw new Error(`API Request failed : ${records.status}`);
    }

    const response = await records.json();
    return response;
  }

  useEffect(() => {
    const timer1 = setTimeout(() => setShow(true), 3 * 1000);

    return () => {
      clearTimeout(timer1);
    };
  }, [show]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = record.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(record.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    getRecord().then(setRecord);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center my-5">
        <Image src={logo} alt="MEDISAT Logo" width={150} height={50} />
        <form action={handleLogout}>
          <Button variant={"auth"}>Logout</Button>
        </form>
      </div>
      <div className="flex flex-wrap justify-center">
        <div>
          <div className="flex flex-wrap justify-center gap-5">
            <div className="flex flex-wrap justify-center">
              <Link
                href={"/patients/geminiAI/"}
                className="text-xl font-bold text-blue-500 hover:text-blue-700">
                Tanya Medisat
              </Link>
            </div>
            <div>
              <Link
                href={"/patients/schedule/"}
                className="text-xl font-bold text-blue-500 hover:text-blue-700">
                Antrian baru
              </Link>
            </div>
          </div>
          {currentRecords.map((el) => (
            <Card el={el} key={el._id} />
          ))}
        </div>
        <div className="join">
          <button
            className="join-item btn"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}>
            «
          </button>
          <button className="join-item btn">
            Page {currentPage} of {totalPages}
          </button>
          <button
            className="join-item btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}>
            »
          </button>
        </div>
      </div>
    </div>
  );
}
