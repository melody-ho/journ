"use client";

import AccountMenu from "./components/account-menu";
import Entries from "../entries";
import styles from "./index.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";
import { useState } from "react";

const ACCOUNT_MENU_CLOSE_DURATION = 300;

export default function Dashboard({ user, userTags }) {
  const [accountMenu, setAccountMenu] = useState(false);

  function toggleAccountMenu() {
    setAccountMenu(!accountMenu);
  }

  function closeAccountMenu() {
    setAccountMenu("animate-out");
    setTimeout(function remove() {
      setAccountMenu(false);
    }, ACCOUNT_MENU_CLOSE_DURATION);
  }

  function preventClose(e) {
    e.stopPropagation(e);
  }

  return (
    <div
      className={styles.page}
      onClick={accountMenu ? closeAccountMenu : null}
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <ThemedImage alt="Journ Logo" imageName="logo" position="left" />
          </div>
          <h1 className={styles.heading}>{`${user.firstName}'s Journ`}</h1>
        </div>
        <div>
          <button
            aria-label="Account Menu"
            className={styles.accountBtn}
            onClick={toggleAccountMenu}
            type="button"
          >
            <div className={styles.accountIcon}>
              <ThemedImage
                alt="Account Icon"
                imageName="account-icon"
                position="center"
              />
            </div>
          </button>
          <nav
            className={styles.desktopOnly}
            hidden={!accountMenu}
            onClick={preventClose}
          >
            {accountMenu ? (
              <AccountMenu
                animateOut={accountMenu === "animate-out"}
                close={closeAccountMenu}
              />
            ) : null}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Entries userId={user.id} userTags={userTags} />
      </main>
      <nav
        className={styles.mobileOnly}
        hidden={!accountMenu}
        onClick={preventClose}
      >
        {accountMenu ? (
          <AccountMenu
            animateOut={accountMenu === "animate-out"}
            close={closeAccountMenu}
          />
        ) : null}
      </nav>
    </div>
  );
}
