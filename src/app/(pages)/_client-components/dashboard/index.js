"use client";

/// imports ///
import AccountMenu from "../account-menu";
import FilteredEntries from "../filtered-entries";
import FiltersMenu from "../filters-menu";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

/// constants ///
// transition duration for closing account menu //
const ACCOUNT_MENU_CLOSE_DURATION = 300;

/// main component ///
export default function Dashboard({ user, userTags }) {
  // states and refs //
  // states
  const [accountMenu, setAccountMenu] = useState(false);
  const [filtersLabel, setFiltersLabel] = useState(false);
  const [filtersMenu, setFiltersMenu] = useState(false);
  const [newEntryLabel, setNewEntryLabel] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  // refs
  const filtersModalRef = useRef(null);

  // handlers for opening/closing account menu //
  function toggleAccountMenu() {
    setAccountMenu(!accountMenu);
  }
  function closeAccountMenu() {
    setAccountMenu("animate-out");
    setTimeout(function remove() {
      setAccountMenu(false);
    }, ACCOUNT_MENU_CLOSE_DURATION);
  }

  // handlers for showing/hiding entries menu labels //
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

  // handlers for opening/closing filters menu //
  // open
  function showFiltersMenu() {
    setFiltersMenu(true);
  }
  useEffect(
    function openFiltersModal() {
      if (filtersModalRef.current) {
        filtersModalRef.current.close();
        filtersModalRef.current.showModal();
      }
    },
    [filtersMenu],
  );
  // close
  function closeFiltersMenu() {
    setFiltersMenu(false);
  }

  // helper function for clicking outside popups to close //
  function preventClose(e) {
    e.stopPropagation(e);
  }

  // function passed to FiltersMenu to get selected filters //
  function getFilters(data) {
    setSelectedStartDate(data.get("startDate"));
    setSelectedEndDate(data.get("endDate"));
    setSelectedTypes(data.getAll("type"));
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
            <ThemedImage alt="Journ Logo" imageName="logo" />
          </div>
          <h1 className={styles.heading}>{`${user.firstName}'s Journ`}</h1>
        </div>
        <div>
          <button
            aria-haspopup="menu"
            aria-label="Toggle account menu"
            className={styles.accountBtn}
            onClick={toggleAccountMenu}
            type="button"
          >
            <div className={styles.accountIcon}>
              <ThemedImage alt="Account Icon" imageName="account-icon" />
            </div>
          </button>
          <div
            className={`${styles.accountMenu} ${styles.desktopOnly}`}
            hidden={!accountMenu}
            onClick={preventClose}
            role="menu"
          >
            {accountMenu ? (
              <AccountMenu
                animateOut={accountMenu === "animate-out"}
                close={closeAccountMenu}
              />
            ) : null}
          </div>
        </div>
      </header>
      <aside className={styles.aside}>
        <menu className={styles.entriesMenu} role="menu">
          <li>
            <button
              aria-haspopup="dialog"
              className={styles.entriesMenuItem}
              onClick={showFiltersMenu}
              onMouseEnter={showFiltersLabel}
              onMouseLeave={hideFiltersLabel}
              type="button"
            >
              <div className={styles.entriesMenuIcon}>
                <ThemedImage alt="Filters Icon" imageName="filters-icon" />
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
                <ThemedImage alt="Add Icon" imageName="add-icon" />
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
        </menu>
        {filtersMenu ? (
          <dialog
            className={styles.filtersMenuModal}
            onClose={closeFiltersMenu}
            ref={filtersModalRef}
          >
            <div
              className={styles.filtersMenuModalWrapper}
              onClick={preventClose}
            >
              <button
                aria-label="Close filters menu"
                className={styles.filtersMenuModalCloseBtn}
                onClick={closeFiltersMenu}
                type="button"
              >
                <ThemedImage alt="close icon" imageName="close-icon" />
              </button>
              <FiltersMenu
                passFilters={getFilters}
                previousEndDate={selectedEndDate}
                previousStartDate={selectedStartDate}
                previousTags={selectedTags}
                previousTypes={selectedTypes}
                userTags={userTags}
              />
            </div>
          </dialog>
        ) : null}
      </aside>
      <main className={styles.main} inert={accountMenu ? "" : null}>
        <section className={styles.entries}>
          <FilteredEntries
            selectedEndDate={selectedEndDate}
            selectedStartDate={selectedStartDate}
            selectedTags={selectedTags}
            selectedTypes={selectedTypes}
            userId={user.id}
            userTags={userTags}
          />
        </section>
      </main>
      <aside
        className={`${styles.accountMenu} ${styles.mobileOnly}`}
        hidden={!accountMenu}
        onClick={preventClose}
        role="menu"
      >
        {accountMenu ? (
          <AccountMenu
            animateOut={accountMenu === "animate-out"}
            close={closeAccountMenu}
          />
        ) : null}
      </aside>
    </div>
  );
}
