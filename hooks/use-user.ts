"use client";

import { getFromLocalstorage } from "@/actions/get-from-LocalStorage";
import { setInLocalstorage } from "@/actions/set-in-LocalStorage";
import { User } from "@/interfaces/user.interface";
import { auth, getDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState<User | undefined | DocumentData>(undefined);
  const pathName = usePathname();
  const route = useRouter();

  const protectedRoutes = "/dashboard";

  const normalizeUser = (u: any): User | undefined => {
    if (!u) return undefined;
    return {
      ...u,
      email: u.email || u.correo || "",
      rol: u.rol === "ADMIN" ? "ADMINISTRADOR" : u.rol,
      uid: u.uid || u.id || ""
    };
  };

  const getUserFromDB = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const res = await getDocument(path);
      const normalized = normalizeUser(res);
      setUser(normalized);
      setInLocalstorage("user", normalized);
    } catch (error) {
      console.error("Error fetching user from database:", error);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      //? SI EL USUARIO ESTÁ AUTENTICADO
      if (authUser) {
        const userInLocal = getFromLocalstorage("user");
        if (userInLocal) {
          setUser(normalizeUser(userInLocal));
        } else {
          await getUserFromDB(authUser.uid);
        }
      }
      //? SI EL USUARIO NO ESTÁ AUTENTICADO
      else {
        if (pathName.startsWith(protectedRoutes)) {
          route.push("/auth");
        }
      }
    });
  }, []);

  return user;
};
