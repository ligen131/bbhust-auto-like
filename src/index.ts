#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 *   bbhust-auto-like - https://github.com/ligen131/bbhust-auto-like
 *
 *   @copyright 2022 ligen131 <1353055672@qq.com>
 *
 *   Licensed under the GNU General Public License, Version 3.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       https://www.gnu.org/licenses/gpl-3.0.html
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
'use strict';
import fetch from 'node-fetch';
import config from '../config/config.json' assert { type: 'json' };

interface userData {
  data:
    | {
        _id: string;
        expire: number;
        token: string;
      }
    | null
    | undefined;
  success: boolean;
  message: string | undefined;
}

interface posts {
  id: string;
  title: string;
  liked: boolean;
}

interface postData {
  data:
    | {
        getLatestPosts: {
          posts: posts[];
        };
      }
    | null
    | undefined;
}

async function login(): Promise<{
  success: boolean;
  message: string | undefined;
  token: string | undefined;
}> {
  const resp = await fetch(
    `https://api.hust.online/bbhust/api/v1/user/token?person_id=${config.person_id}&password=${config.password}`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
      },
      body: null,
      method: 'GET',
    },
  );
  const data = (await resp.json()) as userData;
  return {
    success: data.success,
    message: data?.message,
    token: data?.data?.token,
  };
}

async function getLatestPost(token: string | undefined): Promise<posts[]> {
  const resp = await fetch('https://api.hust.online/bbhust/api/graphql', {
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: `{"query":"query{  getLatestPosts(time: \\"999999999999\\", limit: 15) {  posts {    id title liked  }  }  } "}`,
    method: 'POST',
  });
  const data = (await resp.json()) as postData;
  const arr = data?.data?.getLatestPosts.posts;
  if (!arr) {
    return [];
  }
  return arr.filter((value) => {
    return !value.liked;
  });
}

async function likeAction(token: string, posts: posts[]) {
  console.log('Action like.');
  posts.forEach(async (post) => {
    await fetch('https://api.hust.online/bbhust/api/graphql', {
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: `{"query":"  mutation($id: String!, $liked: Boolean!) {  likePost(id: $id, liked: $liked) {  liked  }  } ","variables":{"id":"${post.id}","liked":true}}`,
      method: 'POST',
    });
    console.log(`Liked post ${post.title}`);
  });
}

async function main() {
  try {
    const user = await login();
    if (!user.success) {
      console.log('Login failed.', user.message);
      return;
    }
    if (user.token) {
      await likeAction(user.token, await getLatestPost(user.token));
    }
  } catch (e) {
    console.log(e);
  }
}

main();
setInterval(main, 20 * 1000);
