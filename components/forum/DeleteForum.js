import React from 'react';
import Popup from 'reactjs-popup';
import { DeleteComment, DeleteThread, DeleteTopic } from '../helpers/ForumDelete';


const DeleteForum = (props) => {
    return (
        <>
           <Popup trigger={props.default ?<a className='btn btn-white text-danger px-4'
           onClick={() => props.handleThreadClick(props.id)}
           >Delete</a> 
           :<span href="#!" className=" pl-3 text-muted"
           onClick={() => props.handleCommentClick(props.id)}
           >
              <i className="fa fa-trash text-danger text-large align-middle" />&nbsp;
              <a className="align-middle cursor text-danger">Delete</a>
            </span>}
            modal
            >
               {close => (
                 props.type == 'thread'? 
                 <DeleteThread 
                 close={close}
                 handleThreadDelete={props.handleThreadDelete}
                 />
                  :<DeleteComment 
                  close={close}
                  handleCommentDelete={props.handleCommentDelete}
                  />
      )}
           </Popup> 
        </>
    )
}

export default DeleteForum
