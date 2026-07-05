package com.storage.folderservice.repo;

import com.storage.folderservice.model.FolderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<FolderEntity,Long> {

    List<FolderEntity> findByParentId(Long parentId);
}
