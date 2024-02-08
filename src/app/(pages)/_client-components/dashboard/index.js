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
/**
 * Transition duration for closing account menu, in ms.
 */
const ACCOUNT_MENU_CLOSE_DURATION = 300;

/// main component ///
/**
 * @param {Object} props
 * @param {{id: string, username: string, firstName: string, lastName: string}} props.userData
 * @param {Array.<{id: string, name: string}>} props.userTags
 */
export default function Dashboard({ userData, userTags }) {
  // document states //
  /**
   * @typedef {boolean | "animate-out"} accountMenuType Indicates display state of account menu.
   */
  /**
   * @typedef {React.Dispatch<boolean | "animate-out">} setAccountMenuType Toggles display state of account menu.
   */
  /**
   * @typedef {boolean} feedResetType Triggers feed reset when changed from false to true. Confirms reset when changed from true to false.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setFeedResetType Triggers feed reset by updating from false to true. Confirms reset by updating from true to false.
   */
  /**
   * @typedef {?Date} filterEndDateType End date in filters.
   */
  /**
   * @typedef {React.Dispatch<?Date>} setFilterEndDateType Updates end date in filters.
   */
  /**
   * @typedef {Array.<"text" | "image" | "video">} filterEntryTypesType Types of entries being filtered.
   */
  /**
   * @typedef {React.Dispatch<Array.<"text" | "image" | "video">>} setFilterEntryTypesType Updates types of entries being filtered.
   */
  /**
   * @typedef {boolean} filtersLabelType Indicates whether "filters" label is displayed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setFiltersLabelType Toggles "filters" label.
   */
  /**
   * @typedef {boolean} filtersMenuType Indicates whether filters menu is displayed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setFiltersMenuType Toggles filters menu.
   */
  /**
   * @typedef {?Date} filterStartDateType Start date in filters.
   */
  /**
   * @typedef {React.Dispatch<?Date>} setFilterStartDateType Updates start date in filters.
   */
  /**
   * @typedef {Array.<string>} filterTagIdsType Ids of tags currently being applied as filters.
   */
  /**
   * @typedef {React.Dispatch<Array.<string>>} setFilterTagIdsType Updates ids of tags to apply as filters.
   */
  /**
   * @typedef {boolean} newEntryLabelType Indicates whether "new entry" label is displayed.
   */
  /**
   * @typedef {React.Dispatch<boolean>} setNewEntryLabelType Toggles "new entry" label.
   */

  // initialize states //
  /**
   * @type {[accountMenuType, setAccountMenuType]}
   */
  const [accountMenu, setAccountMenu] = useState(false);
  /**
   * @type {[feedResetType, setFeedResetType]}
   */
  const [feedReset, setFeedReset] = useState(false);
  /**
   * @type {[filterEndDateType, setFilterEndDateType]}
   */
  const [filterEndDate, setFilterEndDate] = useState(null);
  /**
   * @type {[filterEntryTypesType, setFilterEntryTypesType]}
   */
  const [filterEntryTypes, setFilterEntryTypes] = useState([]);
  /**
   * @type {[filtersLabelType, setFiltersLabelType]}
   */
  const [filtersLabel, setFiltersLabel] = useState(false);
  /**
   * @type {[filtersMenuType, setFiltersMenuType]}
   */
  const [filtersMenu, setFiltersMenu] = useState(false);
  /**
   * @type {[filterStartDateType, setFilterStartDateType]}
   */
  const [filterStartDate, setFilterStartDate] = useState(null);
  /**
   * @type {[filterTagIdsType, setFilterTagIdsType]}
   */
  const [filterTagIds, setFilterTagIds] = useState([]);
  /**
   * @type {[newEntryLabelType, setNewEntryLabelType]}
   */
  const [newEntryLabel, setNewEntryLabel] = useState(false);

  // initialize refs //
  const filtersModalRef = useRef(null);

  // handle opening/closing account menu //
  function toggleAccountMenu() {
    setAccountMenu(!accountMenu);
  }
  function closeAccountMenu() {
    setAccountMenu("animate-out");
    setTimeout(function remove() {
      setAccountMenu(false);
    }, ACCOUNT_MENU_CLOSE_DURATION);
  }

  // handle showing/hiding entries menu labels //
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

  // handle opening/closing filters menu //
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

  // assist clicking outside popups to close //
  function preventClose(e) {
    e.stopPropagation(e);
  }

  // update selected tags and refilter when user tags change //
  useEffect(
    function updateSelectedTags() {
      const userTagIds = userTags.map((userTag) => userTag.id);
      let changed = false;
      const filteredSelectedTags = [];
      for (const filterTagId of filterTagIds) {
        if (userTagIds.includes(filterTagId)) {
          filteredSelectedTags.push(filterTagId);
        } else {
          changed = true;
        }
      }
      if (changed) {
        setFilterTagIds(filteredSelectedTags);
        setFeedReset(true);
      }
    },
    [filterTagIds, userTags],
  );

  // handle applying filters selected in form //
  function applyFilters(filtersFormData) {
    setFilterStartDate(filtersFormData.get("startDate"));
    setFilterEndDate(filtersFormData.get("endDate"));
    setFilterEntryTypes(filtersFormData.getAll("type"));
    setFilterTagIds(filtersFormData.getAll("tags"));
    setFeedReset(true);
  }

  // trigger feed reset //
  function triggerFeedReset() {
    setFeedReset(true);
  }

  // confirm feed reset //
  function confirmFeedReset() {
    setFeedReset(false);
  }

  // render //
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
          <h1 className={styles.heading}>{`${userData.firstName}'s Journ`}</h1>
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
                applyFilters={applyFilters}
                previousEndDate={filterEndDate}
                previousEntryTypes={filterEntryTypes}
                previousStartDate={filterStartDate}
                previousTagIds={filterTagIds}
                userTags={userTags}
              />
            </div>
          </dialog>
        ) : null}
      </aside>
      <main className={styles.main} inert={accountMenu ? "" : null}>
        <section className={styles.entries}>
          <FilteredEntries
            confirmFeedReset={confirmFeedReset}
            feedReset={feedReset}
            filterEndDate={filterEndDate}
            filterEntryTypes={filterEntryTypes}
            filterStartDate={filterStartDate}
            filterTagIds={filterTagIds}
            triggerFeedReset={triggerFeedReset}
            userId={userData.id}
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
