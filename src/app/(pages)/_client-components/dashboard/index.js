"use client";

import AccountMenu from "../account-menu";
import FilteredEntries from "../filtered-entries";
import FiltersMenu from "../filters-menu";
import Link from "next/link";
import styles from "./index.module.css";
import ThemedImage from "@/helper-components/themed-image";
import { useEffect, useRef, useState } from "react";

const ACCOUNT_MENU_CLOSE_DURATION = 300;

export default function Dashboard({ user, userTags }) {
  // initialize states and refs //
  const [accountMenu, setAccountMenu] = useState(false);
  const [filtersLabel, setFiltersLabel] = useState(false);
  const [filtersMenu, setFiltersMenu] = useState(false);
  const [newEntryLabel, setNewEntryLabel] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
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
            aria-label="Account Menu"
            className={styles.accountBtn}
            onClick={toggleAccountMenu}
            type="button"
          >
            <div className={styles.accountIcon}>
              <ThemedImage alt="Account Icon" imageName="account-icon" />
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
          </ul>
        </nav>
        {filtersMenu ? (
          <section>
            <dialog
              className={styles.filtersMenuModal}
              onCancel={closeFiltersMenu}
              ref={filtersMenuModal}
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
          </section>
        ) : null}
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
