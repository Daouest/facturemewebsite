import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/app/lib/session/session-node";
import { connectToDatabase } from "@/app/lib/db/mongodb";
import { DbUsers, DbAddress } from "@/app/lib/models";
import { AddressSchema } from "@/app/lib/schemas/auth";
import { getNextSeq } from "@/app/lib/db/getNextSeq";
import type { CounterDoc } from "@/app/lib/db/getNextSeq";
import mongoose from "mongoose";
import type { Db, Collection } from "mongodb";

export async function GET(_req: NextRequest) {
  const userFromCookie = await getUserFromCookies();
  if (!userFromCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Get user with their address ID
  const user = await DbUsers.findOne({ idUser: userFromCookie.idUser }).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // If user doesn't have an address yet
  if (!user.idAddress) {
    return NextResponse.json(
      {
        address: "",
        city: "",
        province: "",
        zipCode: "",
        country: "CA",
      },
      { status: 200 }
    );
  }

  // Get the address
  const address = await DbAddress.findOne({ idAddress: user.idAddress }).lean();
  if (!address) {
    return NextResponse.json({ message: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      address: (address as any).address ?? "",
      city: (address as any).city ?? "",
      province: (address as any).province ?? "",
      zipCode: (address as any).zipCode ?? "",
      country: (address as any).country ?? "CA",
    },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  const userFromCookie = await getUserFromCookies();
  if (!userFromCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Validate the address data
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.issues },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // Get user
  const user = await DbUsers.findOne({ idUser: userFromCookie.idUser });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  try {
    // If user already has an address, update it
    if (user.idAddress) {
      const updated = await DbAddress.findOneAndUpdate(
        { idAddress: user.idAddress },
        {
          $set: {
            address: parsed.data.address,
            city: parsed.data.city,
            province: parsed.data.province,
            zipCode: parsed.data.zipCode,
            country: parsed.data.country,
          },
        },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          { message: "Address not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Address updated successfully",
          address: {
            address: updated.address,
            city: updated.city,
            province: updated.province,
            zipCode: updated.zipCode,
            country: updated.country,
          },
        },
        { status: 200 }
      );
    } else {
      // Create new address
      const db = mongoose.connection.db as unknown as Db;
      const counters: Collection<CounterDoc> = db.collection<CounterDoc>("counters");
      const newAddressId = await getNextSeq(counters, "addresses");

      const newAddress = await DbAddress.create({
        idAddress: newAddressId,
        address: parsed.data.address,
        city: parsed.data.city,
        province: parsed.data.province,
        zipCode: parsed.data.zipCode,
        country: parsed.data.country,
      });

      // Link address to user
      user.idAddress = newAddressId;
      await user.save();

      return NextResponse.json(
        {
          message: "Address created successfully",
          address: {
            address: newAddress.address,
            city: newAddress.city,
            province: newAddress.province,
            zipCode: newAddress.zipCode,
            country: newAddress.country,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error saving address:", error);
    return NextResponse.json(
      { message: "Error saving address" },
      { status: 500 }
    );
  }
}
