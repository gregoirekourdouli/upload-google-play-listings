import * as core from '@actions/core';
import * as fs from "fs";
import { readFileSync, lstatSync } from "fs";
import JSZip from 'jszip';
import path = require('path');
import { Readable } from 'stream';

import * as google from '@googleapis/androidpublisher';
import { androidpublisher_v3 } from "@googleapis/androidpublisher";

import AndroidPublisher = androidpublisher_v3.Androidpublisher;
import Listing = androidpublisher_v3.Schema$Listing;
import { GoogleAuth } from "google-auth-library/build/src/auth/googleauth"

const androidPublisher: AndroidPublisher = google.androidpublisher('v3');

export interface ListingOptions {
    auth: GoogleAuth;
    applicationId: string;
	language: string;
	title?: string;
	fullDescription?: string;
	shortDescription?: string;
	video?: string;
    changesNotSentForReview?: boolean;
}


export async function runUpload(
    packageName: string,
	language: string,
	title: string,
	fullDescription: string,
	shortDescription: string,
	video: string,
    changesNotSentForReview: boolean
) {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const result = await uploadToPlayStore({
        auth: auth,
        applicationId: packageName,
		language: language,
		title: title,
		fullDescription: fullDescription,
		shortDescription: shortDescription,
		video: video,
		changesNotSentForReview: changesNotSentForReview
    });

    if (result) {
        console.log(`Finished uploading to the Play Store: ${result}`)
    }
}

async function uploadToPlayStore(options: ListingOptions): Promise<string | void> {
	
	const appEditId = await getOrCreateEdit(options);
	
	core.info(`Successfully created edit id ${appEditId}`);
	await addListing(appEditId, options);
	
	// Commit the pending Edit
	core.info(`Committing the Edit`)
	const res = await androidPublisher.edits.commit({
		auth: options.auth,
		editId: appEditId,
		packageName: options.applicationId,
		changesNotSentForReview: options.changesNotSentForReview
	});

	// Simple check to see whether commit was successful
	if (res.data.id) {
		core.info(`Successfully committed ${res.data.id}`);
		return res.data.id;
	} else {
		core.setFailed(`Error ${res.status}: ${res.statusText}`);
		return Promise.reject(res.status);
	}
}

async function addListing(appEditId: string, options: ListingOptions): Promise<Listing> {
	const res = await androidPublisher.edits.listings
		.update({
			auth: options.auth,
			editId: appEditId,
			packageName: options.applicationId,
			language: options.language,
			requestBody: {
				language: options.language,
				title: options.title,
				fullDescription: options.fullDescription,
				shortDescription: options.shortDescription,
				video: options.video
			}
		});

    return res.data;
}


async function getOrCreateEdit(options: ListingOptions): Promise<string> {
    /*
	// If we already have an ID, just return that
    if (options.existingEditId) {
        return options.existingEditId
    }
	*/

    // Else attempt to create a new edit. This will throw if there is an issue
    core.info(`Creating a new Edit for the app ${String(options.applicationId)}`)
	
    const insertResult = await androidPublisher.edits.insert({
        auth: options.auth,
        packageName: options.applicationId
    })

    // If we didn't get status 200, i.e. success, propagate the error with valid text
    if (insertResult.status != 200) {
        throw Error(insertResult.statusText)
    }

    // If the result was successful but we have no ID, somethign went horribly wrong
    if (!insertResult.data.id) {
        throw Error('New edit has no ID, cannot continue.')
    }

    core.debug(`This new edit expires at ${String(insertResult.data.expiryTimeSeconds)}`)
    // Return the new edit ID
    return insertResult.data.id
}
