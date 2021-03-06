import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; count: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; count: number }>(
        `${API_URL}/posts${queryParams}`
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            count: postData.count,
          };
        })
      )
      .subscribe((pipedPosts) => {
        this.posts = pipedPosts.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          count: pipedPosts.count,
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(`${API_URL}/posts/${id}`);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    // postData.append('id', null);
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(`${API_URL}/posts`, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null,
      };
    }
    this.http.put(`${API_URL}/posts/${id}`, postData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string) {
    return this.http.delete(`${API_URL}/posts/${id}`);
  }
}
