"use client";

import AccountMenu from "./components/account-menu";
import FilteredEntries from "./components/filtered-entries";
import FiltersMenu from "./components/filters-menu";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/app/_helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

const ACCOUNT_MENU_CLOSE_DURATION = 300;

export default function Dashboard({ user, userTags }) {
  // initialize states and refs //
  const [accountMenu, setAccountMenu] = useState(false);
  const [filtersLabel, setFiltersLabel] = useState(false);
  const [filtersMenu, setFiltersMenu] = useState(false);
  const [newEntryLabel, setNewEntryLabel] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const filtersMenuModal = useRef(null);

  // open and close account menu //
  function toggleAccountMenu() {
    setAccountMenu(!accountMenu);
  }

  function closeAccountMenu() {
    setAccountMenu("animate-out");
    setTimeout(function remove() {
      setAccountMenu(false);
    }, ACCOUNT_MENU_CLOSE_DURATION);
  }

  // show and hide entry menu labels //
  function showFiltersLabel() {
    setFiltersLabel(true);
  }

  function hideFiltersLabel() {
    setFiltersLabel(false);
  }

  function showNewEntryLabel() {
    setNewEntryLabel(true);
  }

  function hideNewEntryLabel() {
    setNewEntryLabel(false);
  }

  // open and close filters menu //
  function showFiltersMenu() {
    setFiltersMenu(true);
  }

  useEffect(
    function openFiltersModal() {
      if (filtersMenuModal.current) {
        filtersMenuModal.current.close();
        filtersMenuModal.current.showModal();
      }
    },
    [filtersMenu],
  );

  function closeFiltersMenu() {
    setFiltersMenu(false);
  }

  // helper function for clicking outside popups to close //
  function preventClose(e) {
    e.stopPropagation(e);
  }

  // get selected filters //
  function getFilters(data) {
    setSelectedTags(data.getAll("tags"));
  }

  return (
    <div
      className={styles.page}
      onClick={
        accountMenu ? closeAccountMenu : filtersMenu ? closeFiltersMenu : null
      }
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
      <main className={styles.main} inert={accountMenu ? "" : null}>
        <nav>
          <ul className={styles.entriesMenu}>
            <li>
              <button
                className={styles.entriesMenuItem}
                onClick={showFiltersMenu}
                onMouseEnter={showFiltersLabel}
                onMouseLeave={hideFiltersLabel}
                type="button"
              >
                <div className={styles.entriesMenuIcon}>
                  <ThemedImage
                    alt="Filters Icon"
                    imageName="filters-icon"
                    position="center"
                  />
                </div>
                <p
                  className={`${styles.entriesMenuLabel} ${
                    filtersLabel ? styles.entriesMenuLabelShow : null
                  }`}
                >
                  filters
                </p>
              </button>
            </li>
            <li>
              <Link
                className={styles.entriesMenuItem}
                href="./new-entry"
                onMouseEnter={showNewEntryLabel}
                onMouseLeave={hideNewEntryLabel}
              >
                <div className={styles.entriesMenuIcon}>
                  <ThemedImage
                    alt="Add Icon"
                    imageName="add-icon"
                    position="center"
                  />
                </div>
                <p
                  className={`${styles.entriesMenuLabel} ${
                    newEntryLabel ? styles.entriesMenuLabelShow : null
                  }`}
                >
                  new entry
                </p>
              </Link>
            </li>
          </ul>
        </nav>
        {filtersMenu ? (
          <section>
            <dialog onCancel={closeFiltersMenu} ref={filtersMenuModal}>
              <div onClick={preventClose}>
                <FiltersMenu passFilters={getFilters} userTags={userTags} />{" "}
              </div>
            </dialog>
          </section>
        ) : null}
        <section className={styles.entries}>
          <FilteredEntries selectedTags={selectedTags} userId={user.id} />
        </section>
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
